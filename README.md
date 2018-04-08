Deezer Project: **TagApp**
---

# DB user credentials
* username: `dzr-tagapp`
* password: `b.iOn7rkVfA3Um.hIXu9Y5ozByCxE3m`
* connexion string (BOLT): `bolt://hobby-cpenebmekcnhgbkekkadncal.dbs.graphenedb.com:24786`


# Running the app

Run `docker-compose up`.


# DB UML

![UML](.\UML.png)

As there is a lot of N:M relations, the natural choice is graph databases. 

This will prevent redundancy and will also facilitate the implementation of more complex request later on.

Relations between artists, albums and track are _not_ implemented but it could easily be done.

I chose **Neo4j** as it the most well known graph DB and seems to be the easiest to use.

## Possibilities for future

* Add a weight on the `TAGS` relation to quantify how rock a song is.
* Implement the missing relations.

# Architecture

## Node.js + Vue.js + Neo4j

* **Server app** that can be used as an API
* **Front app** that can talk to the server (and hopefully to deezer's API).

# Front fonctionalities

* Search for tagged content
* Tag content
* (Interface the tag db with the deezer API)

# Server functionnalities

## Add tags to content, OK !

`POST /artist/123` or `POST /track/456` or `POST /album/789`

Request body (tag list) `["tag_a", "tag_b", ...]`

## Get tags associated with content OK !

`GET /artist/123` 

Response body (list of tags) `["tag_a", "tag_b", ... ]`

## Delete content OK !

`DELETE /artist/123` 

## Delete tags OK !

`DELETE /artist/123` 

Request body (tag list) `["tag_a", "tag_b", ...]`

## Get content list from a tag set OK !

Returns the content that has all the requested tags

`GET /album?tags[]=tag_a&tags[]=tag_b` or `GET /track?tags[]=...` or `GET /artist?tags[]=...`

Response body (list of ids) `[123, 456, ... ]`

## Export all the tagged content OK !

Returns one json object per line.

`GET /export`

Response body
```
{"type":"artist", "id": 123, "tags":["tag_a", "tag_b", ...]}
{"type":"track",  "id": 456, "tags":["tag_c", "tag_d", ...]}
{"type":"album",  "id": 789, "tags":["tag_e", "tag_f", ...]}
...
```
