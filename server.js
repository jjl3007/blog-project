/*********************************************************************************
*  WEB322 – Assignment 01
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Juan Jose Lozano Reyes     Student ID: 165463217   Date: 2023-03-31
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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

var port = process.env.PORT || 8080;

cloudinary.config({     
    cloud_name: 'diw2dugzg',
    api_key: '263662487831944',
    api_secret: 'bOsOaS3sE1DpEg0jy-EcyQWeHW4',
    secure: true
});

const upload = multer(); // no { storage: storage } 

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: { 
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        },        

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },

        safeHTML: function(context){
            return stripJs(context);
        }
    }
}));
app.set('view engine', '.hbs');

blogService.initialize().then(() => {
        app.listen(8080, () => {
            console.log("Server started on port " + port);
        });
    })
    .catch((err) => {
        console.error(err);
    });

app.get('/about', function (req, res) {
    res.render('about');
});
    

app.get('/', function (req, res) {
    res.redirect('/blog');
});

app.use(express.urlencoded({ extended: true }));

app.get('/posts/add', (req, res) => {
    blogService.getCategories()
      .then((data) => {
        res.render('addPost', { categories: data });
      })
      .catch((err) => {
        res.render('addPost', { categories: [] });
      });
  });

app.post('/posts/add', upload.single('featureimage'), (req, res) => {
    if (req.file) {
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
  
      upload(req).then((uploaded) => {
        processPost(uploaded.url);
      });
    } else {
      processPost('');
    }
  
    function processPost(imageUrl) {
      req.body.featureImage = imageUrl;
  
      blogService.addPost(req.body).then((data) => {
        res.redirect('/blog');
      }).catch((err) => {
        res.status(500).send('Unable to add post');
      });
    }
  });
  

app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
            viewData.viewingCategory = req.query.category;
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {
    // Declare an object    to store properties for the view
    let viewData = {};

    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
            viewData.viewingCategory = req.query.category;
        } else {
            posts = await blogService.getPublishedPosts();
        }

        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post = await blogService.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData });
});


app.get('/posts', function (req, res) {
    let renderPosts = (posts) => {
        if (posts.length > 0) {
            res.render("posts", { posts: posts });
        } else {
            res.render("posts", { message: "no results" });
        }
    };

    let renderError = () => {
        res.render("posts", { message: "no results" });
    };

    if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate)
            .then(renderPosts)
            .catch(renderError);
    } else if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
            .then(renderPosts)
            .catch(renderError);
    } else if (req.query.id) {
        blogService.getPostById(req.query.id)
            .then((post) => {
                renderPosts([post]);
            })
            .catch(renderError);
    } else {
        blogService.getPublishedPosts()
            .then(renderPosts)
            .catch(renderError);
    }
});

app.get('/posts/delete/:id', (req, res) => {
    const postId = req.params.id;
  
    blogService.deletePostById(postId)
      .then(() => {
        res.redirect('/posts');
      })
      .catch((err) => {
        res.status(500).send('Unable to remove post / Post not found');
      });
  });
  

app.get("/categories", (req, res) => {
    let renderCategories = (categories) => {
        if (categories.length > 0) {
            res.render("categories", { categories: categories });
        } else {
            res.render("categories", { message: "no results" });
        }
    };

    let renderError = () => {
        res.render("categories", { message: "no results" });
    };

    blogService.getCategories()
        .then(renderCategories)
        .catch(renderError);
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
    blogService
      .addCategory(req.body)
      .then(() => {
        res.redirect('/categories');
      })
      .catch((err) => {
        res.status(500).send('Error: unable to add category');
      });
});

app.get('/categories/delete/:id', (req, res) => {
    blogService
      .deleteCategoryById(req.params.id)
      .then(() => {
        res.redirect('/categories');
      })
      .catch((err) => {
        res.status(500).send('Unable to Remove Category / Category not found');
      });
});

app.use(function (req, res) {
    res.status(404).render('404');
});
