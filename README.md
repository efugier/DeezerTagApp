Deezer project: **Tag app**
---

![](https://i.imgur.com/DVSVBER.png)

# Running the app

Run the following commands in the main folder.

For the server:
```
> cd tag-server
> docker build -t tag-sever .
> docker run -p 8081:8081 tag-server
```

For the front:
```
> cd tag-front
> docker build -t tag-front .
> docker run -p 8080:8080 tag-front
```

The app is then available at [http://localhost:8080/#/track](http://localhost:8080/#/track) or [http://0.0.0.0:8080/#/track](http://0.0.0.0:8080/#/track)

While the API listens on port `8081`.

The app can also be used without docker by running `npm install` and `npm start` in both `./tag-server` and `./tag-front`. 

## Accessing the db

### Informations

As this is only a demo, I chose to conveniently host the data base (for free) on graphendb which means it is:
* Asleep when inactive so the *very first* connexion is **very slow**.
* Hosted in Nothern Viginia (US) which leads somewhat **slow** response time.
* Limited to **1k** nodes
* Limited to **10k** relations

### Visualization

The db can be visualized [here](https://app.graphenedb.com/dbs/dzrtagdemo/overview) using these credentials
* login:    `dzrtagdemo@yopmail.com`
* password: `dzrtagdemopwd`

Log in, then go at the bottom of the page, Tools: Neo4j browser, click `Launch`.


### Server side use

**DB app credentials**
* username: `server-user`
* password: `b.TIFIvn8dL3qz.ewj9o7s3m2Xs7iHk`
* connexion string (BOLT): `bolt://hobby-ecmbfbmekcnhgbkeephhacal.dbs.graphenedb.com:24786`


# Overview

<!-- ![UML](.\UML.png) -->
![UML](https://i.imgur.com/OL5et8p.png)

As there is a lot of N:M relations and high potential for redundancy, the natural choice is graph databases. 

This could also facilitate the implementation of more complex request later on.

Relations between artists, albums and tracks are _not_ implemented in this demo.

I chose **Neo4j** as it the most well known graph DB and seemed to be the easiest to use. However, **Orientdb** seems to be more suitable for alrge scale projects.

## Possibilities for future

* Add a weight on the `TAGS` relations to quantify how rock a song is.
* Implement the missing relations between artists, albums and tracks.

# Stack

## Neo4j + Express +Node.js + Vue.js

* **Server API**
* **Front** that can talk to the server and to deezer's API.


# Front functionalities
* Add and delete content by ids
* Search for content given a set of tags
* Get more infos on clicked content and edit its tags
* Edited tags will only be sent to the db when `Submit` is clicked

## Server functionalities actually used in the front
* `GET` tagged content
* `POST` create content
* `POST` replace content
* `DELETE` content


# Server functionalities

## Add tags to content

`POST /artist/123` or `POST /track/456` or `POST /album/789`

Request body (tag list) `["tag_a", "tag_b", ...]`

## Replace content

Replaces the tag list by a new one

**/!\ suboptimal implementation**

`POST /artist/123/replace` or `POST /track/456/replace`

Request body (tag list) `["tag_a", "tag_b", ...]`


## Get tags associated with content

`GET /artist/123`

Response body (list of tags) `["tag_a", "tag_b", ...]`

## Get content list from a tag set

Returns the content that has all the requested tags

`GET /album?tags[]=tag_a&tags[]=tag_b` or `GET /track?tags[]=...` or `GET /artist?tags[]=...`

Response body (list of ids and tags) 
```
[
    { id: 123 tags: [tag_a, tag_b, tag_c...] },
    { id: 456 tags: [tag_a, tag_b,...] },
    ...
]
```

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


## Delete tags

`DELETE /artist/123/tag`

Request body (tag list) `["tag_a", "tag_b", ...]`

## Delete content

`DELETE /artist/123`

## Why no names/titles in the table ?

Limited to 50 requests per 30s to deezer's server + the current architecture would be very inefficient.
