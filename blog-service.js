const Sequelize = require('sequelize');

var sequelize = new Sequelize('udpbasgi', 'udpbasgi', 'VPv5x4zO0fQj6gF2sUkklkTp3bL7gXU5', {
  host: 'peanut.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Post model
const Post = sequelize.define('Post', {
  body: {
      type: Sequelize.TEXT
  },
  title: {
      type: Sequelize.STRING
  },
  postDate: {
      type: Sequelize.DATE
  },
  featureImage: {
      type: Sequelize.STRING
  },
  published: {
      type: Sequelize.BOOLEAN
  }
});

// Category model
const Category = sequelize.define('Category', {
  category: {
      type: Sequelize.STRING
  }
});

// Relationship between Post and Category
Post.belongsTo(Category, { foreignKey: 'categoryId' });

// Export the models
module.exports = { Post, Category };  

const initialize = () => {
  return new Promise((resolve, reject) => {
      sequelize.sync()
          .then(() => {
              resolve();
          })
          .catch((err) => {
              reject("unable to sync the database");
          });
  });
};


const getAllPosts = () => {
  return new Promise((resolve, reject) => {
      Post.findAll()
          .then((data) => {
              resolve(data);
          })
          .catch((err) => {
              reject("no results returned");
          });
  });
};


const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
      Post.findAll({ where: { published: true } })
          .then((data) => {
              resolve(data);
          })
          .catch((err) => {
              reject("no results returned");
          });
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    console.log('getCategories function called');
      Category.findAll()
          .then((data) => {
              resolve(data);
          })
          .catch((err) => {
              reject("no results returned");
          });
  });
};


const addPost = (postData) => {
  return new Promise((resolve, reject) => {
      postData.published = postData.published ? true : false;
      
      for (const key in postData) {
          if (postData[key] === "") {
              postData[key] = null;
          }
      }
      
      postData.postDate = new Date();

      Post.create(postData)
          .then(() => {
              resolve();
          })
          .catch((err) => {
              reject("unable to create post");
          });
  });
};

const getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
      Post.findAll({ where: { categoryId: category } })
          .then((data) => {
              resolve(data);
          })
          .catch((err) => {
              reject("no results returned");
          });
  });
};

const getPostsByMinDate = (minDateStr) => {
  const { gte } = Sequelize.Op;

  return new Promise((resolve, reject) => {
      Post.findAll({
          where: {
              postDate: {
                  [gte]: new Date(minDateStr)
              }
          }
      })
          .then((data) => {
              resolve(data);
          })
          .catch((err) => {
              reject("no results returned");
          });
  });
};


const getPostById = (id) => {
  return new Promise((resolve, reject) => {
      Post.findAll({ where: { id: id } })
          .then((data) => {
              if (data.length > 0) {
                  resolve(data[0]);
              } else {
                  reject("no results returned");
              }
          })
          .catch((err) => {
              reject("no results returned");
          });
  });
};

const getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
      Post.findAll({ where: { published: true, category: category } })
          .then((data) => {
              resolve(data);
          })
          .catch((err) => {
              reject("no results returned");
          });
  });
};

const addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    for (let key in categoryData) {
      if (categoryData[key] === "") {
        categoryData[key] = null;
      }
    }

    Category.create(categoryData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create category");
      });
  });
};

const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to delete category");
      });
  });
};

const deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.destroy({ where: { id: id } })
      .then((deletedRows) => {
        if (deletedRows > 0) {
          resolve();
        } else {
          reject("Post not found");
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};



module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById, getPublishedPostsByCategory, addCategory, deleteCategoryById, deletePostById };
