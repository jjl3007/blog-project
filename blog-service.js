
var posts = [];
var categories = [];

const fs = require("fs"); // required at the top of your module

const initialize = () => {
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

const getAllPosts = () =>{
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
        reject("no results returned for getAllPosts");
        } else {
        resolve(posts);
        }
    });
}

const getPublishedPosts = () =>{
    return new Promise((resolve, reject) => {
        let publishedPosts = posts.filter((post) => post.published === true);
        if (publishedPosts.length === 0) {
        reject("no results returned for getPublishedPosts");
        } else {
        resolve(publishedPosts);
        }
    });
}

const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
        reject("no results returned for getCategories");
        } else {
        resolve(categories);
        }
    });
}

module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories };