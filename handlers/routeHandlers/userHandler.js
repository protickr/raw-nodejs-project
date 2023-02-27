// dependencies
const data = require("../../lib/data");
const { hash, parseJSON } = require("../../helpers/utilities");

const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._users = {};
// TODO: authentication
// create
handler._users.post = (requestProperties, callback) => {
  const requestBody = requestProperties.body;
  const firstName =
    typeof requestBody.firstName === "string" &&
    requestBody.firstName.trim().length > 0
      ? requestBody.firstName
      : null;
  const lastName =
    typeof requestBody.lastName === "string" &&
    requestBody.lastName.trim().length > 0
      ? requestBody.lastName
      : null;
  const phone =
    typeof requestBody.phone === "string" &&
    requestBody.phone.trim().length === 11
      ? requestBody.phone
      : null;
  const password =
    typeof requestBody.password === "string" &&
    requestBody.password.trim().length > 0
      ? requestBody.password
      : null;
  const tosAgreement =
    typeof requestBody.tosAgreement === "boolean" && requestBody.tosAgreement;

  if (firstName && lastName && phone && password && tosAgreement) {
    // check if user exists
    data.read("users", phone, (err1, user) => {
      if (err1) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        // store the user to db
        data.create("users", phone, userObject, (err2) => {
          if (!err2) {
            callback(200, { message: "User was created successfully !" });
          } else {
            callback(500, { error: "Could not create user" });
          }
        });
      } else {
        callback(400, {
          error: "user already exists! ",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

// read
handler._users.get = (requestProperties, callback) => {
  // check the phone number is valid
  const phoneNumber = requestProperties.queryStrObj.phone;
  const phone =
    typeof phoneNumber === "string" && phoneNumber.trim().length === 11
      ? phoneNumber
      : null;
  if (phone) {
    data.read("users", phone, (err1, user) => {
      if (!err1 && user) {
        const userObj = parseJSON(user);
        delete userObj.password;
        callback(200, userObj);
      } else {
        callback(404, { error: "user not found !" });
      }
    });
  } else {
    callback(404, {
      error: "requested user is not found !",
    });
  }
};

// update
handler._users.put = (requestProperties, callback) => {
  const requestBody = requestProperties.body;
  const firstName =
    typeof requestBody.firstName === "string" &&
    requestBody.firstName.trim().length > 0
      ? requestBody.firstName
      : null;
  const lastName =
    typeof requestBody.lastName === "string" &&
    requestBody.lastName.trim().length > 0
      ? requestBody.lastName
      : null;
  const phone =
    typeof requestBody.phone === "string" &&
    requestBody.phone.trim().length === 11
      ? requestBody.phone
      : null;
  const password =
    typeof requestBody.password === "string" &&
    requestBody.password.trim().length > 0
      ? requestBody.password
      : null;

  if (phone) {
    if (firstName || lastName || password) {
      // check if user exists with provided phone number
      data.read("users", phone, (err1, u) => {
        if (!err1 && u) {
          const user = { ...parseJSON(u) };
          if (firstName) {
            user.firstName = firstName;
          }

          if (lastName) {
            user.lastName = lastName;
          }

          if (password) {
            user.password = hash(password);
          }

          // store to database
          data.update("users", phone, user, (err2) => {
            if (!err2) {
              callback(200, { message: "user was updated successfully !" });
            } else {
              callback(500, {
                message: "there was a problem in the server side !",
              });
            }
          });
        } else {
          callback(400, {
            error: "You have a problem in your request !",
          });
        }
      });
    } else {
      callback(400, {
        error: "You have a problem in your request !",
      });
    }
  } else {
    callback(400, {
      error: "Invalid phone number !",
    });
  }
};

// delete
handler._users.delete = (requestProperties, callback) => {
  const phoneNumber = requestProperties.queryStrObj.phone;
  const phone =
    typeof phoneNumber === "string" && phoneNumber.trim().length === 11
      ? phoneNumber
      : null;

  if (phone) {
    // lookup the user
    data.read("users", phone, (err1, userData) => {
      if (!err1 && userData) {
        data.delete("users", phone, (err2) => {
          if (!err2) {
            callback(200, { message: "user was deleted successfully!" });
          } else {
            callback(500, { error: "there was a server side error !" });
          }
        });
      } else {
        callback(500, { error: "there was a server side error !" });
      }
    });
  } else {
    callback(400, { error: "there was a problem in your request!" });
  }
};

module.exports = handler;
