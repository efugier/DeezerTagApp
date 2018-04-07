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


// Query wrapper to return tags list
app.getIdQuery = (res, query, params) => {
    const session = driver.session()
    session
        .run(query, params)
        .then(function (result) {
            let tags = []
            result.records.forEach(function (record) {
                console.log(record.get("id"))
                tags.push(record.get("id"))
            })
            session.close()
            res.send(tags)
        })
        .catch(function (error) {
            console.log(error)
            res.send({ success: false, message: error })
        })
}


// // Query wrapper to
// app.getTaggedQuery = (res, query, params) => {
//     const session = driver.session()
//     session
//         .run(query, params)
//         .then(function (result) {
//             let tags = []
//             result.records.forEach(function (record) {
//                 console.log(record.get("_id"))
//                 tags.push(record.get("_id"))
//             })
//             session.close()
//             res.send(tags)
//         })
//         .catch(function (error) {
//             console.log(error)
//             res.send({ success: false, message: error })
//         })
// }

// Query wrapper to return tags list
app.getExportQuery = (res, query, params) => {
    const session = driver.session()
    session
        .run(query, params)
        .then(function (result) {
            let tags = []
            result.records.forEach(function (record) {
                console.log(record.get("tag"))
                tags.push(record.get("tag"))
            })
            session.close()
            res.send(tags)
        })
        .catch(function (error) {
            console.log(error)
            res.send({ success: false, message: error })
        })
}

// // Query wrapper to return tags list
// app.getTagQuery = (res, query, params) => {
//     const session = driver.session()

//     var tags = []
//     session
//         .run(query, params)
//         .subscribe({
//             onNext: function (record) {
//                 console.log(record.get("tag"))
//                 tags.push(record.get("tag"))
//             },
//             onCompleted: function () {
//                 session.close();
//             },
//             onError: function (error) {
//                 console.log(error);
//             }
//         })
//     return tags
// }


const validLabels = ["tag", "track", "album", "artist"]


// HTTP requests

// GET content tags
app.get('/:label/:id', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {
        const query = "MATCH (n:" + req.params.label + "), (t:tag) \
        WHERE n._id = {id} AND (t)-[:TAGS]->(n) RETURN t._id AS id"
        const params = { id: req.params.id }
        app.getIdQuery(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

// works:           (t0:tag { _id : {tag0} })
// does not work    (:tag { _id : {tag0} })

//MERGE (n:track { _id : {id} }) MERGE (t0:tag { _id : {tag0} }) MERGE (t0)-[:TAGS]->(n) MERGE (t1:tag { _id : {tag1} }) MERGE (t1)-[:TAGS]->(n) MERGE (t2:tag { _id : {tag2} }) MERGE (t2)-[:TAGS]->(n) 
//MATCH (n:artist) WHERE (:tag { _id : {tag0} })-[:TAGS]->(a) RETURN n._id AS id 

// GET tagged content
// MATCH (a:artist) WHERE (:tag {_id: "rock"})-[:TAGS]->(a) RETURN a
app.get('/:label?', (req, res) => {
    console.log(req.query)
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {
        let query = "MATCH (n:" + req.params.label + ")"
        let params = { id: req.params.id }

        // Processing the tags
        if (Array.isArray(req.query.tags) && req.query.tags.length > 0) {
            i = 0
            query += " WHERE"
            for (let tag of req.query.tags) {
                tagi = "tag" + i++
                params[tagi] = tag
                // Where the node is tagged by each tag
                query += " (:tag { _id : {" + tagi + "} })-[:TAGS]->(n)"
                if (i < req.query.tags.length) { query += " AND" }
            }
        }
        query += " RETURN n._id AS id"
        console.log(query, params)
        app.getIdQuery(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

// GET export
app.get('/:label/:id', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {
        const query = "MATCH (n:" + req.params.label + "), (t:tag) \
        WHERE n._id = {id} AND (t)-[:TAGS]->(n) RETURN t._id AS tag"
        const params = { id: req.params.id }
        app.getTagQuery(res, query, params)
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
        app.getIdQuery(query, params)
        app.writeQuery(res, query, params)
    } else {
        res.send({ success: false, message: "Invalid label" })
    }
})


// DELETE
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


app.listen(process.env.PORT || 8081)
