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
            res.send({ success: false, message: "Query successful" })
        })
        .catch(function (error) {
            console.log(error)
            res.send({ success: false, message: error })
        })
}


// Query wrapper to return tags list
app.getTagQuery = (res, query, params) => {
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


const validLabels = ["tag", "track", "album", "artist"]


// HTTP requests

// GET
app.get('/:label/:id', (req, res) => {
    // Check if the label is legit
    if (validLabels.indexOf(req.params.label) > -1) {
        const query = "MATCH (n:" + req.params.label + "), (t:tag) \
        WHERE n._id = {id} AND (t)-[:TAGS]->(n) RETURN t._id AS tag"
        const params = { id: req.params.id }
        app.getTagQuery(res, query, params)
        // records = app.writeQuery(res, query, params)
        // res.send(records)
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
        app.writeQuery(res, query, params)
    } else {
        res.send({ success: false, message: "Invalid label" })
    }
})

// // Post Query for a given label
// app.post('/newTrack/:id', (req, res) => {
//     const params = {
//         idTrack: id
//     }
//     const query = "MERGE (n:Track { _id : {idTrack} }) RETURN n._id AS _id"

//     app.writeQuery(res, query, params)
// })


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
