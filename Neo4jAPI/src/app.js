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


// Querry wrapper

app.sendQuerry = (res, req, params = {}) => {
    const session = driver.session()
    session
        .run(req, params)
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record)
            })
            session.close()
            res.send({
                success: true,
                message: 'Querry successful!'
            })
        })
        .catch(function (error) {
            console.log(error)
            res.send({
                success: false,
                message: error
            })
        })
}


// POST

app.post('/new/:label/:id', (req, res) => {
    // Check if the label is legit
    if (["Tag", "Track", "Album", "Artist"].indexOf(req.params.label) > -1) {
        const params = { idTag: req.params.id }
        const querry = "MERGE (n:" + req.params.label + " { _id : {idTag} }) RETURN n._id AS _id"
        app.sendQuerry(res, querry, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})

// // Static Post Querry
// app.post('/newTrack/:id', (req, res) => {
//     const params = {
//         idTrack: id
//     }
//     const querry = "MERGE (n:Track { _id : {idTrack} }) RETURN n._id AS _id"

//     app.sendQuerry(res, querry, params)
// })


// DELETE

app.delete('/del/:label/:id', (req, res) => {
    // Check if the label is legit
    if (["Tag", "Track", "Album", "Artist"].indexOf(req.params.label) > -1) {
        const querry = "MATCH (n:" + req.params.label + " { _id : {id} }) DELETE n"
        const params = { label: req.params.label, id: req.params.id }
        app.sendQuerry(res, querry, params)
    } else {
        console.log("Invalid label")
        res.send({ success: false, message: "Invalid label" })
    }
})


// GET

app.get('/posts', (req, res) => {
    res.send(
        [{
            title: "Hello World!",
            description: "Hi there! How are you?"
        }]
    )
})

app.listen(process.env.PORT || 8081)
