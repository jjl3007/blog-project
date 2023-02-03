// use express
const express = require('express');
const app = express();
const path = require('path');

// use blog-service
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

// setup a 'route' to listen on the default url path (http://localhost)
app.get('/about', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/about.html'));
});

// redirect user to about page
app.get('/', function (req, res) {
    res.redirect('/about');
});

// setup a route to listen on blog and get all the posts who have published == true
// this route will return a json formatted string whose published property is true
app.get("/blog", (req, res) => {
    blogService.getAllPosts().then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            console.error(err);
            res.send(err);
        });
});

// setup a route to listen on blog and returns all posts within the posts.json file
// this route will return a json formatted string of all posts
app.get("/posts", (req, res) => {
    blogService.getPublishedPosts().then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            console.error(err);
            res.send(err);
        });
});

// setup a route to listen on categories and returns all categories within the posts.json file
// this route will return a json formatted string of all categories
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

// no matching route, return error message 404
app.use(function (req, res) {
    res.status(404).send("Page not found");
});