// dependencies
const data = require("../../lib/data");

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

// create
handler._token.post = (requestProperties, callback) => {};

// read
handler._token.get = (requestProperties, callback) => {};

// update
handler._token.put = (requestProperties, callback) => {};

// delete
handler._token.delete = (requestProperties, callback) => {};

module.exports = handler;
