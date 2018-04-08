Deezer Project: **TagApp**
---

# Running the app

Run `docker-compose up`.

The API is then listening on port `8081`.

## Accessing the db

### Informations

As this is only a demo, I chose for convinience to host the data base (for free) on graphendb which means it is:
* Limited to $1k$ nodes
* Limited to $10k$ relations
* Hosted in Nothern Viginia (US) which leads somewhat slow response time.

### Visualization

Can be visualized [here](https://hobby-ecmbfbmekcnhgbkeephhacal.dbs.graphenedb.com:24786/browser/) using these credentials
* login:    `dzrtagdemo`
* password: `dzrtagdemopwd`

### Server side use

**DB app credentials**
* username: `server-user`
* password: `b.TIFIvn8dL3qz.ewj9o7s3m2Xs7iHk`
* connexion string (BOLT): `bolt://hobby-ecmbfbmekcnhgbkeephhacal.dbs.graphenedb.com:24786`


# Overview

![UML](.\UML.png)

As there is a lot of N:M relations and high potential for redundancy, the natural choice is graph databases. 

This could also facilitate the implementation of more complex request later on.

Relations between artists, albums and tracks are _not_ implemented in this demo.

I chose **Neo4j** as it the most well known graph DB and seemed to be the easiest to use.

## Possibilities for future

* Add a weight on the `TAGS` relation to quantify how rock a song is.
* Implement the missing relations between artists, albums and tracks.

# Stack

## Neo4j + Node.js (+ Vue.js) 

* **Server app** that can be used as an API
* **Coming soon**: Front app that can talk to the server (and hopefully to deezer's API).

# Server functionnalities

## Add tags to content

`POST /artist/123` or `POST /track/456` or `POST /album/789`

Request body (tag list) `["tag_a", "tag_b", ...]`

## Get tags associated with content

`GET /artist/123` 

Response body (list of tags) `["tag_a", "tag_b", ... ]`

## Delete content

`DELETE /artist/123` 

## Delete tags

`DELETE /artist/123/tag` 

Request body (tag list) `["tag_a", "tag_b", ...]`

## Get content list from a tag set

Returns the content that has all the requested tags

`GET /album?tags[]=tag_a&tags[]=tag_b` or `GET /track?tags[]=...` or `GET /artist?tags[]=...`

Response body (list of ids) `[123, 456, ... ]`

## Export all the tagged content

Returns one json object per line.

`GET /export`

Response body
```
{"type":"artist", "id": 123, "tags":["tag_a", "tag_b", ...]}
{"type":"track",  "id": 456, "tags":["tag_c", "tag_d", ...]}
{"type":"album",  "id": 789, "tags":["tag_e", "tag_f", ...]}
...
```

# Deisred front fonctionalities

* Search for tagged content
* Tag content
* (Interface the tag db with the deezer API)
