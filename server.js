/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Juan Jose Lozano Reyes     Student ID: 165463217   Date: 2023-02-03
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 



const express = require('express');
const app = express();
const path = require('path');
const blogService = require('./blog-service.js');

var port = process.env.PORT || 8080;

blogService.initialize().then(() => {
        app.listen(8080, () => {
            console.log("Server started on port 8080");
        });
    })
    .catch((err) => {
        console.error(err);
    });

app.get('/about', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/about.html'));
});

app.get('/', function (req, res) {
    res.redirect('/about');
});


app.get("/blog", (req, res) => {
    blogService
        .getAllPosts()
        .then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            console.error(err);
            res.send(err);
        });
});

app.get("/posts", (req, res) => {
    blogService
        .getPublishedPosts()
        .then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            console.error(err);
            res.send(err);
        });
});

app.get("/categories", (req, res) => {
    blogService
        .getCategories()
        .then((categories) => {
            res.send(categories);
        })
        .catch((err) => {
            console.error(err);
            res.send(err);
        });
});

app.use(function (req, res) {
    res.status(404).send("Page not found");
});
