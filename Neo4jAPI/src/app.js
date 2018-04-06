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
        })
}

app.post('/newTag', (req, res) => {
    const params = {
        idTag: req.body._id
    }
    const querry = "CREATE (n:Tag { _id : {idTag} }) RETURN n._id AS _id"

    app.sendQuerry(res, querry, params)
})

app.post('/newTrack', (req, res) => {
    const params = {
        idTrack: req.body._id
    }
    const querry = "CREATE (n:Track { _id : {idTrack} }) RETURN n._id AS _id"

    app.sendQuerry(res, querry, params)
})

app.post('/newAlbum', (req, res) => {
    const params = {
        idAlbum: req.body._id
    }
    const querry = "CREATE (n:Album { _id : {idAlbum} }) RETURN n._id AS _id"

    app.sendQuerry(res, querry, params)
})

app.post('/newArtist', (req, res) => {
    const params = {
        idArtist: req.body._id
    }
    const querry = "CREATE (n:Artist { _id : {idArtist} }) RETURN n._id AS _id"

    app.sendQuerry(res, querry, params)
})

app.delete('/del/:label/:id', (req, res) => {
    console.log(querry, id, label)
    const querry = "MATCH (n:{label} { _id : {id} }) DELETE n"
    const params = { label: req.params.label, id: req.params.id }

    app.sendQuerry(res, querry, params)
})


app.get('/posts', (req, res) => {
    res.send(
        [{
            title: "Hello World!",
            description: "Hi there! How are you?"
        }]
    )
})

app.listen(process.env.PORT || 8081)
