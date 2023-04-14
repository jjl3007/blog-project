const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [
        {
            dateTime: Date,
            userAgent: String,
        },
    ],
});

let User;

const initialize = () => {
    return new Promise(function (resolve, reject) {
        const connectionString = "mongodb+srv://dbUser:juanjose3007@senecaweb.jy0tvef.mongodb.net/Assignment6?retryWrites=true&w=majority";
        let db = mongoose.createConnection(connectionString);

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

const registerUser = (userData) => {
    return new Promise((resolve, reject) => {
      if (userData.userName && userData.password && userData.email) {
        // Check if the user already exists
        User.findOne({ userName: userData.userName })
          .then((user) => {
            if (user) {
              reject(`User ${userData.userName} already exists.`);
            } else {
              // Encrypt the password
              bcrypt.hash(userData.password, 10)
                .then((hash) => {
                  userData.password = hash;
  
                  // Save the user to the database
                  User.create(userData)
                    .then(() => {
                      resolve();
                    })
                    .catch((err) => {
                      reject(`There was an error creating the user: ${err}`);
                    });
                })
                .catch((err) => {
                  reject(`There was an error encrypting the password: ${err}`);
                });
            }
          })
          .catch((err) => {
            reject(`There was an error: ${err}`);
          });
      } else {
        reject('User name, password, and email are required.');
      }
    });
  };
  

  const checkUser = (userData) => {
    return new Promise((resolve, reject) => {
      if (userData.userName && userData.password) {
        // Find the user in the database
        User.findOne({ userName: userData.userName })
          .then((user) => {
            if (!user) {
              reject(`User ${userData.userName} not found.`);
            } else {
              // Compare the hashed password with the entered password
              bcrypt.compare(userData.password, user.password)
                .then((result) => {
                  if (result) {
                    // Update the user's login history
                    user.loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                    User.updateOne({ userName: userData.userName }, { $set: { loginHistory: user.loginHistory } })
                      .then(() => {
                        resolve(user);
                      })
                      .catch((err) => {
                        reject(`There was an error updating the user's login history: ${err}`);
                      });
                  } else {
                    reject(`Incorrect password for user: ${userData.userName}`);
                  }
                })
                .catch((err) => {
                  reject(`There was an error comparing the passwords: ${err}`);
                });
            }
          })
          .catch((err) => {
            reject(`There was an error: ${err}`);
          });
      } else {
        reject('User name and password are required.');
      }
    });
  };
  

module.exports = {initialize, checkUser, registerUser};