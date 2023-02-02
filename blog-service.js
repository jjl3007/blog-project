// declare 2 global variables, posts and categories, both type array
var posts = [];
var categories = [];

const fs = require("fs"); // required at the top of your module

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", "utf8", (err, data) => {
            if (err) {
                reject("unable to read posts.json file");
            } else {
                posts = JSON.parse(data);
                fs.readFile("./data/categories.json", "utf8", (err, data) => {
                    if (err) {
                        reject("unable to read categories.json file");
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
};

// getAllPosts function
// ·	This function will provide the full array of "posts" objects using the resolve method of the 
//      returned promise.  
// ·	If for some reason, the length of the array is 0 (no results returned), this function must invoke the reject method and pass a meaningful message, i.e. "no results returned".

function getAllPosts(){
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
        reject("no results returned for getAllPosts");
        } else {
        resolve(posts);
        }
    });
}

function getPublishedPosts(){
    return new Promise((resolve, reject) => {
        let publishedPosts = posts.filter((post) => post.published === true);
        if (publishedPosts.length === 0) {
        reject("no results returned for getPublishedPosts");
        } else {
        resolve(publishedPosts);
        }
    });
}

function getCategories(){
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
        reject("no results returned for getCategories");
        } else {
        resolve(categories);
        }
    });
}

module.exports = {
    initialize: initialize,
    getAllPosts: getAllPosts,
    getPublishedPosts: getPublishedPosts,
    getCategories: getCategories
};