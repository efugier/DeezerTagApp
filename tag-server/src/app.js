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
    writeOnly(res, query, params) {
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
    getIds(res, query, params) {
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

    // Export
    // write data chunk by chunk in the response
    exportData(res, query) {
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


// Building Cypher requests

const makeQuery = {
    export() {

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
        return query
    },

    getTags(label, id) {

        // MATCH (n:label {_id: {id} }) RETURN [(n)<-[:TAGS]-(t:tag) | t._id] AS ids

        const query = "MATCH (n:" + label + " { _id: {id} }) \
         RETURN [(n)<-[:TAGS]-(t:tag) | t._id] AS ids"
        const params = { id: id }
        return [query, params]
    },

    getTaggedContent(label, tags) {

        // id + tags: WITH ['jazz'] AS tags MATCH (n:artist) WHERE ALL(tag in tags WHERE (:tag {_id: tag})-[:TAGS]->(n)) RETURN collect({id: n._id, tags: [(n)<-[:TAGS]-(t) | t._id]})

        // WITH ['pop', 'rock'] AS tags 
        // MATCH (n:label) 
        // WHERE ALL(tag in tags WHERE (:tag {_id: tag})-[:TAGS]->(n)) RETURN collect(n._id)

        let params = { tags: tags }
        let query = "WITH {tags} AS tags " +
            "MATCH (n:" + label + ") " +
            "WHERE ALL(tag in tags WHERE (:tag {_id: tag})-[:TAGS]->(n)) RETURN collect(n._id) AS ids"

        return [query, params]
    },

    newContent(label, id, tags) {

        // MERGE (n:label { _id: {id} })
        // MERGE (t0:tag { _id: {tag0} }) MERGE (t0)-[:TAGS]->(n)
        // MERGE (t1:tag { _id: {tag1} }) MERGE (t1)-[:TAGS]->(n) 
        // ...

        // Can't only merge the relations as it would create duplicates 
        // if one end already exists and not the other

        // Merge the node
        let query = "MERGE (n:" + label + " { _id : {id} })"
        let params = { id: id }

        console.log("Hey1")

        // Processing the tags
        if (Array.isArray(tags)) {
            console.log("Hey2")
            i = 0
            for (let tag of tags) {
                let ti = "t" + i, tagi = "tag" + i++
                params[tagi] = tag.toLowerCase()
                // Merge each tag and merge the connexion
                query += " MERGE (" + ti + ":tag { _id : {" + tagi + "} })" + " MERGE (" + ti + ")-[:TAGS]->(n)"
            }
        }

        return [query, params]
    },

    replaceContent(label, id, tags) {

        let [query, params] = makeQuery.deleteContent(label, id)

        query += " MERGE (l:" + label + " { _id : {id} })"

        if (Array.isArray(tags)) {
            i = 0
            for (let tag of tags) {
                let ti = "t" + i, tagi = "tag" + i++
                params[tagi] = tag.toLowerCase()
                // Merge each tag and merge the connexion
                query += " MERGE (" + ti + ":tag { _id : {" + tagi + "} })" + " MERGE (" + ti + ")-[:TAGS]->(l)"
            }
        }

        // const [queryNew, params] = makeQuery.newContent(label, id, tags)

        return [query, params]
    },

    deleteContent(label, id) {

        // MATCH (n:label {_id: {id} }) DETACH DELETE n

        const query = "MATCH (n:" + label + " { _id : {id} }) DETACH DELETE n"
        const params = { id: id }

        return [query, params]
    },

    deleteTags(label, id, tags) {

        // MATCH (n:label { _id: {id} })<-[r:TAGS]-(t:tag { _id: {tag0} }) DELETE r;
        // MATCH (n:label { _id: {id} })<-[r:TAGS]-(t:tag { _id: {tag1} }) DELETE r;
        // ...

        let query = ""
        let params = { id: id }
        i = 0
        for (let tag of tags) {
            // look for each relation and delete it
            tagi = "tag" + i++
            params[tagi] = tag.toLowerCase()
            query += "MATCH (:" + label + " { _id : {id} })\
                <-[r:TAGS]-(:tag { _id: {" + tagi + "} }) DELETE r; "
        }

        return [query, params]
    },



}



// HTTP requests handling

const validLabels = ["tag", "track", "album", "artist"]

// GET

// Export
app.get('/export', (req, res) => {
    const query = makeQuery.export()

    console.log(query)
    queries.exportData(res, query)
})

// Content tags
app.get('/:label/:id', (req, res) => {
    // Check if the label is legit 
    if (validLabels.indexOf(req.params.label) > -1) {

        const label = req.params.label
        const id = req.params.label != "tag" ? Number(req.params.id) : req.params.id

        const [query, params] = makeQuery.getTags(label, id)
        console.log(query, params)
        queries.getIds(res, query, params)

    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

//  Tagged content
app.get('/:label?', (req, res) => {
    // Check if the label is legit 
    if (validLabels.indexOf(req.params.label) > -1) {

        const [query, params] = makeQuery.getTaggedContent(req.params.label, req.query.tags)

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
    // Check if the label is legit 
    if (validLabels.indexOf(req.params.label) > -1) {

        const label = req.params.label
        const id = req.params.label != "tag" ? Number(req.params.id) : req.params.id

        const [query, params] = makeQuery.newContent(label, id, req.body)

        console.log(query, params)
        queries.writeOnly(res, query, params)
    } else {
        res.send({ success: false, message: "Invalid label" })
    }
})

// New content with tags replacing the old one
app.post('/:label/:id/replace', (req, res) => {
    // Check if the label is legit 
    if (validLabels.indexOf(req.params.label) > -1) {
        const label = req.params.label
        const id = req.params.label != "tag" ? Number(req.params.id) : req.params.id

        // server-side diff using sets VS DETACH DELETE then merge all the new tags
        // or just 2 array in the request's body
        // which one is faster

        const [query, params] = makeQuery.replaceContent(label, id, Array.isArray(req.body) ? req.body : [])

        console.log(query, params)
        queries.writeOnly(res, query, params)
    } else {
        res.send({ success: false, message: "Invalid label" })
    }
})


// DELETE

// Delete content
app.delete('/:label/:id', (req, res) => {
    // Check if the label is legit 
    if (validLabels.indexOf(req.params.label) > -1) {

        const label = req.params.label
        const id = req.params.label != "tag" ? Number(req.params.id) : req.params.id

        const [query, params] = makeQuery.deleteContent(label, id)

        console.log(query, params)
        queries.writeOnly(res, query, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

// Remove tags from content
app.delete('/:label/:id/tags', (req, res) => {
    // Check if the label is legit 
    if (validLabels.indexOf(req.params.label) > -1) {
        if (Array.isArray(req.body) && req.body.length > 0) {

            const label = req.params.label
            const id = req.params.label != "tag" ? Number(req.params.id) : req.params.id

            const [query, params] = makeQuery.deleteTags(label, id, req.body)

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
