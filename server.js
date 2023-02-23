/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Juan Jose Lozano Reyes     Student ID: 165463217   Date: 2023-02-03
*
*  Cyclic Web App URL: https://dull-rose-tuna-wig.cyclic.app
*
*  GitHub Repository URL: https://github.com/jjl3007/web322-app
*
********************************************************************************/ 



const express = require('express');
const app = express();
const path = require('path');
const blogService = require('./blog-service.js');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

var port = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'diw2dugzg',
    api_key: '263662487831944',
    api_secret: 'bOsOaS3sE1DpEg0jy-EcyQWeHW4',
    secure: true
});

const upload = multer(); // no { storage: storage } 

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

app.get('/posts/add', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/addPost.html'));
});

app.use(express.urlencoded({ extended: true }));

app.post('/posts/add', upload.single('featureimage'), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }
     
    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
    
        blogService.addPost(req.body).then((data) => {
            res.redirect("/blog");
        }
        ).catch((err) => {
            res.status(500).send("Unable to add post");
        }
        );
    } 
    
});

app.get("/blog", (req, res) => {
    blogService.getAllPosts().then((posts) => {
            res.send(posts);
        })
        .catch((err) => {
            console.error(err);
            res.send(err);
        });
});

app.get('/posts', function (req, res) {
    if (req.query.minDate) {
      blogService.getPostsByMinDate(req.query.minDate).then((posts) => {
        res.send(posts);
      }).catch((err) => {
        res.status(500).send("Unable to get posts");
      });
    } else if (req.query.category) {
      blogService.getPostsByCategory(req.query.category).then((posts) => {
        res.send(posts);
      }).catch((err) => {
        res.status(500).send("Unable to get posts");
      });
    } else if (req.query.id) {
        blogService.getPostById(req.query.id).then((post) => {
            res.send(post);
        }).catch((err) => {
            res.status(500).send("Unable to get post");
        });
    }
    else 
    {
      blogService.getPublishedPosts().then((posts) => {
        res.send(posts);
      }).catch((err) => {
        console.error(err);
        res.send(err);
      });
    }
  });
  
  
app.get("/categories", (req, res) => {
    blogService.getCategories().then((categories) => {
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
