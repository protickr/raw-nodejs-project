// imortant utility function

// dependencies
const crypto = require("crypto");
const environment = require("./environments");

// module scaffolding
const utilities = {};

utilities.parseJSON = (jsonStr) => {
  let output;
  try {
    output = JSON.parse(jsonStr);
  } catch (err) {
    console.log(err);
    output = {};
  }

  return output;
};

// hash string
utilities.hash = (tobeEnc) => {
  if (typeof tobeEnc === "string" && tobeEnc.length > 0) {
    return crypto
      .createHmac("sha256", environment.secretKey)
      .update(tobeEnc)
      .digest("hex");
  } else {
    return false;
  }
};

// create random string
utilities.createRandomString = (strLength) => {
  let length = strLength;
  length = typeof strLength === "number" && strLength > 0 ? strLength : false;
  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let output = "";
    for (let i = 1; i <= length; i++) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  } else {
    return false;
  }
};

module.exports = utilities;
