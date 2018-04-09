const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())



const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver("bolt://hobby-ecmbfbmekcnhgbkeephhacal.dbs.graphenedb.com:24786",
    neo4j.auth.basic("server-user", "b.TIFIvn8dL3qz.ewj9o7s3m2Xs7iHk"))

const queries = {
    // Query to DB using the BOLT protocol

    // Write only query wrapper
    writeOnly: (res, query, params) => {
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
    },


    // Query wrapper to return an array of content ids
    getIds: (res, query, params) => {
        const session = driver.session()
        let ids = []
        session
            .run(query, params)
            .subscribe({
                onNext: function (record) {
                    ids.push.apply(ids, record.get("ids"))  // faster than concat for in place merging of 2 arrays
                },
                onCompleted: function () {
                    res.send(ids)
                    session.close();
                },
                onError: function (error) {
                    console.log(error);
                    res.send({ success: false, message: error })
                }
            })
    },

    // export
    // write data chunk by chunk in the response
    exportData: (res, query) => {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked',
            'Trailer': 'Content-MD5'
        });
        const session = driver.session()
        session
            .run(query)
            .subscribe({
                onNext: function (record) {
                    const newObj = {
                        "type": record.get("label")[0],
                        "id": record.get("id"),
                        "tags": record.get("tags")
                    }
                    res.write(JSON.stringify(newObj) + '\n')
                },
                onCompleted: function () {
                    res.addTrailers({ 'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667' })
                    res.end()
                    session.close();
                },
                onError: function (error) {
                    console.log(error);
                    res.send({ success: false, message: error })
                }
            })
    }
}



// HTTP requests
// Basically truning http into Cypher 

const validLabels = ["tag", "track", "album", "artist"]

// GET

// Export
app.get('/export', (req, res) => {

    // MATCH (n:artist) RETURN labels(n) AS label, n._id AS id, [(n)<-[:TAGS]-(t:tag) | t._id] AS tags
    // UNION
    // MATCH (n:track) RETURN labels(n) AS label, n._id AS id, [(n)<-[:TAGS]-(t:tag) | t._id] AS tags
    // ...

    let query = ""
    const typeOfContent = ["artist", "album", "track"]
    i = 0
    for (let contentType of typeOfContent) {
        query += "MATCH (n:" + contentType + ") \
        RETURN labels(n) AS label, n._id AS id, [(n)<-[: TAGS]-(t: tag) | t._id] AS tags"
        if (++i < typeOfContent.length) { query += " UNION " }
    }
    console.log(query)
    queries.exportData(res, query)
})

// Content tags
app.get('/:label/:id', (req, res) => {
    // Check if the label is legit (prevents injection)
    if (validLabels.indexOf(req.params.label) > -1) {

        // MATCH (n:label {_id: {id} }) RETURN [(n)<-[:TAGS]-(t:tag) | t._id] AS ids

        const label = req.params.label
        const id = req.params.label != "tags" ? Number(req.params.id) : req.params.id

        const query = "MATCH (n:" + label + " { _id: {id} }) \
         RETURN [(n)<-[:TAGS]-(t:tag) | t._id] AS ids"
        const params = { id: id }
        console.log(query, params)
        queries.getIds(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

//  Tagged content
app.get('/:label?', (req, res) => {
    // Check if the label is legit (prevents injection)
    if (validLabels.indexOf(req.params.label) > -1) {

        // Let's build a query that looks like this:
        // MATCH (n:artist) 
        // RETURN [(n)<-[:TAGS]-(:tag {_id: {tag0}}) AND (n)<-[:TAGS]-(:tag {_id: {tag1}}) AND ... | n._id] AS ids

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
        queries.getIds(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})



// POST
// New content with tags
app.post('/:label/:id', (req, res) => {
    // Check if the label is legit (prevents injection)
    if (validLabels.indexOf(req.params.label) > -1) {

        // MERGE (n:label { _id: {id} })
        // MERGE (t0:tag { _id: {tag0} }) MERGE (t0)-[:TAGS]->(n)
        // MERGE (t1:tag { _id: {tag1} }) MERGE (t1)-[:TAGS]->(n) 
        // ...

        // Can't only merge the relations as it would create duplicates 
        // if one end already exists and not the other

        const label = req.params.label
        const id = req.params.label != "tags" ? Number(req.params.id) : req.params.id

        // Merge the node
        let query = "MERGE (n:" + label + " { _id : {id} })"
        let params = { id: id }

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
        queries.writeOnly(res, query, params)
    } else {
        res.send({ success: false, message: "Invalid label" })
    }
})


// DELETE

// Delete content
app.delete('/del/:label/:id', (req, res) => {
    // Check if the label is legit (prevents injection)
    if (validLabels.indexOf(req.params.label) > -1) {

        // MATCH (n:label {_id: {id} }) DETACH DELETE n

        const label = req.params.label
        const id = req.params.label != "tags" ? Number(req.params.id) : req.params.id

        const query = "MATCH (n:" + label + " { _id : {id} }) DETACH DELETE n"
        const params = { id: id }
        console.log(query, params)
        queries.writeOnly(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

// Remove tags from content
app.delete('/del/:label/:id/tags', (req, res) => {
    // Check if the label is legit (prevents injection)
    if (validLabels.indexOf(req.params.label) > -1) {
        if (Array.isArray(req.body) && req.body.length > 0) {

            // MATCH (n:label { _id: {id} })<-[r:TAGS]-(t:tag { _id: {tag0} }) DELETE r;
            // MATCH (n:label { _id: {id} })<-[r:TAGS]-(t:tag { _id: {tag1} }) DELETE r;
            // ...

            const label = req.params.label
            const id = req.params.label != "tags" ? Number(req.params.id) : req.params.id

            let query = ""
            let params = { id: id }
            i = 0
            for (let tag of req.body) {
                // look for each relation and delete it
                tagi = "tag" + i++
                params[tagi] = tag
                query += "MATCH (:" + label + " { _id : {id} })\
                <-[r:TAGS]-(:tag { _id: {" + tagi + "} }) DELETE r; "
            }
            console.log(query, params)
            queries.writeOnly(res, query, params)
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
