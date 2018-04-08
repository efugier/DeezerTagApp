const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver("bolt://hobby-cpenebmekcnhgbkekkadncal.dbs.graphenedb.com:24786", neo4j.auth.basic("dzr-tagapp", "b.iOn7rkVfA3Um.hIXu9Y5ozByCxE3m"))


const fs = require('fs')

// Query to DB using the BOLT protocol


// Write Query wrapper
app.writeQuery = (res, query, params) => {
    const session = driver.session()
    session
        .run(query, params)
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record)
            })
            session.close()
            res.send({ success: true, message: "Query successful" })
        })
        .catch(function (error) {
            console.log(error)
            res.send({ success: false, message: error })
        })
}


// Query wrapper to return ids list

app.getIdsQuery = (res, query, params) => {
    const session = driver.session()
    const readTxResultPromise = session.readTransaction(function (transaction) {
        let result = transaction.run(query, params);
        return result;
    })
    readTxResultPromise.then(function (result) {
        session.close();
        let ids = []
        for (record of result.records) {
            ids.push.apply(ids, record.get("ids"))  // faster than concat for in place merging of 2 arrays
        }
        res.send(ids)
    }).catch(function (error) {
        console.log(error)
    })
}


// Stream query 

app.exportData = (res, query, params) => {
    const session = driver.session()
    const readTxResultPromise = session.readTransaction(function (transaction) {
        let result = transaction.run(query, params);
        return result;
    })
    readTxResultPromise.then(function (result) {
        session.close();
        res.send(result.records.length > 0 ? result.records[0].get("ids") : [])
    }).catch(function (error) {
        console.log(error)
    })
}


const validLabels = ["tag", "track", "album", "artist"]


// HTTP requests

// GET content tags
app.get('/:label/:id', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {

        // MATCH (n:label {_id: id}) RETURN [(n)<-[:TAGS]-(t:tag) | t._id] AS ids

        const query = "MATCH (n:" + req.params.label + " { _id: {id} }) \
         RETURN [(n)<-[:TAGS]-(t:tag) | t._id] AS ids"
        const params = { id: req.params.id }
        // app.getIdsQuery(res, query, params)
        app.getIdsQuery(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

// GET tagged content
// MATCH (a:artist) WHERE (:tag {_id: "rock"})-[:TAGS]->(a) RETURN a
app.get('/:label?', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {

        // Let's build a query that looks like this:
        // MATCH (n:artist) 
        // RETURN [(n)<-[:TAGS]-(t:tag {_id: {tag0}}) AND (n)<-[:TAGS]-(t:tag {_id: {tag1}}) | n._id] AS ids

        let params = {}
        let query = "MATCH (n:" + req.params.label + ") RETURN "
        // Processing tags
        if (Array.isArray(req.query.tags) && req.query.tags.length > 0) {
            i = 0
            query += " ["
            for (let tag of req.query.tags) {
                // add (n)<-[:TAGS]-(t:tag {_id: {tagi} })
                tagi = "tag" + i++
                params[tagi] = tag
                // Where the node is tagged by each tag
                query += "(:tag { _id : {" + tagi + "} })-[:TAGS]->(n)"
                if (i < req.query.tags.length) { query += " AND " }
            }
            query += " | n._id]"
        } else {
            query += "[n._id]"
        }
        query += " AS ids"
        console.log(query, params)
        app.getIdsQuery(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})



// POST
app.post('/new/:label/:id', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {
        // Merge the node
        let query = "MERGE (n:" + req.params.label + " { _id : {id} })"
        let params = { id: req.params.id }

        // Processing the tags
        if (Array.isArray(req.body)) {
            i = 0
            for (let tag of req.body) {
                let ti = "t" + i, tagi = "tag" + i++
                params[tagi] = tag
                // Merge each tag and merge the connexion
                query += " MERGE (" + ti + ":tag { _id : {" + tagi + "} })" + " MERGE (" + ti + ")-[:TAGS]->(n)"
            }
        }
        console.log(query, params)
        app.writeQuery(res, query, params)
    } else {
        res.send({ success: false, message: "Invalid label" })
    }
})


// DELETE

// Delete content
app.delete('/del/:label/:id', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {
        const query = "MATCH (n:" + req.params.label + " { _id : {id} }) DETACH DELETE n"
        const params = { id: req.params.id }
        app.writeQuery(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

// Remove tags from content
app.delete('/del/:label/:id/tags', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {
        if (Array.isArray(req.body) && req.body.length > 0) {
            let query = ""
            let params = { id: req.params.id }
            i = 0
            for (let tag of req.body) {
                // look for each relation and delete it
                tagi = "tag" + i++
                params[tagi] = tag
                query += "MATCH (:" + req.params.label + " { _id : {id} })\
                <-[r:TAGS]-(:tag { _id: {" + tagi + "} }) DELETE r; "
            }
            console.log(query, params)
            app.writeQuery(res, query, params)
        } else {
            console.log("Invalid or empty body")
            res.send({ success: false, message: "Invalid or empty body" })
        }
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})


app.listen(process.env.PORT || 8081)
