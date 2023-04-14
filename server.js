/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Juan Jose Lozano Reyes     Student ID: 165463217   Date: 2023-04-14
*
*  Cyclic Web App URL: https://dull-rose-tuna-wig.cyclic.app
*
*  GitHub Repository URL: https://github.com/jjl3007/web322-app
*
********************************************************************************/ 



const express = require('express');
const app = express();

const blogService = require('./blog-service.js');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const authData = require('./auth-service.js');
const clientSessions = require('client-sessions');

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

app.use(
    clientSessions({
        cookieName: "session",
        secret: "juan_jose",
        duration: 30 * 60 * 1000, // 30 minutes
        activeDuration: 5 * 60 * 1000, // 5 minutes
        cookie: { secure: false, httpOnly: false }
    })  
);


app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
})

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

function ensureLogin(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      res.redirect('/login');
    }
  }
  
authData.initialize()
  .then(() => {
    return blogService.initialize();
  })
  .then(() => {
    app.listen(port, () => {
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

app.get('/posts/add', ensureLogin, (req, res) => {
    blogService.getCategories()
      .then((data) => {
        res.render('addPost', { categories: data });
      })
      .catch((err) => {
        res.render('addPost', { categories: [] });
      });
  });

app.post('/posts/add', ensureLogin, upload.single('featureimage'), (req, res) => {
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


app.get("/posts", ensureLogin, function (req, res) {
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

app.get('/posts/delete/:id', ensureLogin, (req, res) => {
    const postId = req.params.id;
  
    blogService.deletePostById(postId)
      .then(() => {
        res.redirect('/posts');
      })
      .catch((err) => {
        res.status(500).send('Unable to remove post / Post not found');
      });
  });
  

  app.get("/categories", ensureLogin, function (req, res) {
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

app.get('/categories/add', ensureLogin, (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', ensureLogin, (req, res) => {
    blogService
      .addCategory(req.body)
      .then(() => {
        res.redirect('/categories');
      })
      .catch((err) => {
        res.status(500).send('Error: unable to add category');
      });
});

app.get('/categories/delete/:id', ensureLogin, (req, res) => {
    blogService
      .deleteCategoryById(req.params.id)
      .then(() => {
        res.redirect('/categories');
      })
      .catch((err) => {
        res.status(500).send('Unable to Remove Category / Category not found');
      });
});

app.get('/login', (req, res) => {
    res.render('login');
  });

app.get('/register', (req, res) => {
    res.render('register');
    });

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(() => {
        res.render('register', { successMessage: 'User created' });
        })
        .catch((err) => {
         res.render('register', { errorMessage: err, userName: req.body.userName });
        });
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
  
    authData.checkUser(req.body)
      .then((user) => {
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory,
        };
        res.redirect('/posts');
      })
      .catch((err) => {
        res.render('login', { errorMessage: err, userName: req.body.userName });
      });
  });

  app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
  });

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
});

app.use(function (req, res) {
    res.status(404).render('404');
});
