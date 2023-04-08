// dependencies
const data = require("../../lib/data");
const {
  hash,
  parseJSON,
  createRandomString,
} = require("../../helpers/utilities");

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

// create token by providing phone number / unique identifier and password
handler._token.post = (requestProperties, callback) => {
  const requestBody = requestProperties.body;
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

  if (phone && password) {
    // if user exists with provided with phone and password provided
    data.read("users", phone, (err1, userData) => {
      let hashedPassword = hash(password);
      let user = { ...parseJSON(userData) }; // only applicable to 1 level of nested objects
      if (user.password === hashedPassword) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObj = {
          phone,
          id: tokenId,
          expires,
        };

        // store the token
        data.create("tokens", tokenId, tokenObj, (err2) => {
          if (!err2) {
            callback(200, tokenObj);
          } else {
            callback(500, { error: "there was a problem in the server side!" });
          }
        });
      } else {
        callback(400, { error: "provided password is not correct!" });
      }
    });
  } else {
    callback(400, { error: "You have a problem in your request" });
  }
};

// read
handler._token.get = (requestProperties, callback) => {
  // check the token number is valid
  const idReq = requestProperties.queryStrObj.id;
  const id =
    typeof idReq === "string" && idReq.trim().length === 20 ? idReq : null;
  if (id) {
    data.read("tokens", id, (err1, tokenData) => {
      if (!err1 && tokenData) {
        const tokenObj = parseJSON(tokenData);
        callback(200, tokenObj);
      } else {
        callback(404, { error: "token not found !" });
      }
    });
  } else {
    callback(404, {
      error: "requested token is not found !",
    });
  }
};

// update
// extend token expiry time
handler._token.put = (requestProperties, callback) => {
  const idReq = requestProperties.body.id;
  const id =
    typeof idReq === "string" && idReq.trim().length === 20 ? idReq : null;

  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : false;

  if (id && extend) {
    data.read("tokens", id, (err1, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      // console.log(token.expires > Date.now());

      if (!err1 && token.expires > Date.now()) {
        token.expires = Date.now() + 60 * 60 * 1000;

        // store the updated token
        data.update("tokens", id, token, (err2) => {
          if (!err2) {
            callback(200);
          } else {
            callback(500, {
              error: "There was a problem in the server side !",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token already expired !",
        });
      }
    });
  } else {
    callback(400, {
      error: "requested token was not found !",
    });
  }
}; 

// delete
handler._token.delete = (requestProperties, callback) => {
  // check the token if valid
  const idReq = requestProperties.queryStrObj.id;
  const id =
    typeof idReq === "string" && idReq.trim().length === 20
      ? idReq
      : null;

  if (id) {
    // lookup the token by id
    data.read("tokens", id, (err1, tokenData) => {
      if (!err1 && tokenData) {
        data.delete("tokens", id, (err2) => {
          if (!err2) {
            callback(200, { message: "token was deleted successfully!" });
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

handler._token.verify  = (id, phone, callback) => {
  data.read('tokens', id, (err1, tokenData) => {
    
    if(!err1 && tokenData){
      if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
        callback(true);
      }else{
        callback(false);
      }      
    }else {
      callback(false);
    }
  });
};

module.exports = handler;
