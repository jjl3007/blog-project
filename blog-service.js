
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

const addPost = (postData) => {
    return new Promise((resolve, reject) => {
        if (postData.title === "" || postData.content === "") {
        reject("unable to create post with missing title or content");
        } else {
        postData.id = posts.length + 1;
        postData.published = false;

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        postData.postDate = `${year}-${month}-${day}`;
        console.log(postData.postDate);

        posts.push(postData);
        fs.writeFile("./data/posts.json", JSON.stringify(posts), (err) => {
            if (err) {
            reject("unable to write to posts.json file");
            } else {
            resolve();
            }
        });
        }
    });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => post.category == category);
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject('no results returned');
    }
  });
}

  
function getPostsByMinDate(minDateStr) {
  const minDate = new Date(minDateStr);
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => new Date(post.postDate) >= minDate);
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject('no results returned');
    }
  });
}

  
  function getPostById(id) {
    return new Promise((resolve, reject) => {
      const post = posts.find(post => post.id == id);
      if (post) {
        resolve(post);
      } else {
        reject('no result returned');
      }
    });
  }

  function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
      const filteredPosts = posts.filter(post => post.category == category && post.published == true);
      if (filteredPosts.length > 0) {
        resolve(filteredPosts);
      } else {
        reject('no results returned');
      }
    });
    }


module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById, getPublishedPostsByCategory };