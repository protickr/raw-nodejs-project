// dependencies
const data = require('../../lib/data');
const {
  hash,
  parseJSON,
  createRandomString,
} = require('../../helpers/utilities');
const { verify } = require('./tokenHandler')._token;
const { maxChecks } = require('../../helpers/environments');

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._check = {};

// create
handler._check.post = (requestProperties, callback) => {
  // validate inputs => protocol, domain, request method, success code, timeout in seconds
  let protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === 'string' &&
    ['get', 'post', 'put', 'delete'].indexOf(
      requestProperties.body.method?.toLowerCase().trim()
    ) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === 'object' &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    requestProperties.body.timeoutSeconds % 1 == 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    let tokenId =
      typeof requestProperties.headersObj.token === 'string'
        ? requestProperties.headersObj.token
        : false;

    if (tokenId) {
      // lookup phoneNumbr by token
      data.read('tokens', tokenId, (err1, tokenData) => {
        if (!err1 && tokenData) {
          const tokenObj = parseJSON(tokenData);
          const phoneNumber = tokenObj.phone;
          //lookup user by phone
          data.read('users', phoneNumber, (err2, userData) => {
            if (!err2 && userData) {
              let userObj = parseJSON(userData);

              verify(tokenId, phoneNumber, isVerified => {
                if (isVerified) {
                  let userChecks =
                    typeof userObj.checks === 'object' &&
                    userObj.checks instanceof Array
                      ? userObj.checks
                      : [];

                  userObj.checks = userChecks;

                  if (userObj.checks.length < maxChecks) {
                    let checkId = createRandomString(20);
                    let checkObj = {
                      id: checkId,
                      userPhone: phoneNumber,
                      protocol,
                      url,
                      method,
                      successCodes,
                      timeoutSeconds,
                    };
                    // save check object
                    data.create('checks', checkId, checkObj, err3 => {
                      if (!err3) {
                        userObj.checks.push(checkId);
                        // update and store user's data
                        data.update('users', phoneNumber, userObj, err4 => {
                          if (!err4) {
                            callback(200, checkObj);
                          } else {
                            callback(500, {
                              error:
                                'there was an error occurred in the server',
                            });
                          }
                        });
                      } else {
                        callback(500, {
                          error: 'there was an error occurred in the server',
                        });
                      }
                    });
                  } else {
                    callback(401, {
                      error: 'User has already reached max check limit',
                    });
                  }
                } else {
                  callback(403, { error: 'Authentication failure' });
                }
              });
            } else {
              callback(404, { error: 'user not found' });
            }
          });
        } else {
          callback(403, { error: 'Authentication failure' });
        }
      });
    } else {
      callback(404, { error: 'token id was not proided' });
    }
  } else {
    callback(400, { error: 'there was a problem in your request!' });
  }
};

// read
handler._check.get = (requestProperties, callback) => {
  const checkId =
    typeof requestProperties.queryStrObj.id === 'string' &&
    requestProperties.queryStrObj.id.trim().length === 20
      ? requestProperties.queryStrObj.id.trim()
      : false;

  const tokenId =
    typeof requestProperties.headersObj.token === 'string' &&
    requestProperties.headersObj.token.trim().length === 20
      ? requestProperties.headersObj.token.trim()
      : false;

  if (checkId) {
    data.read('checks', checkId, (err1, checkData) => {
      if (!err1 && checkData) {
        const checkObj = parseJSON(checkData);

        if (tokenId) {
          verify(tokenId, checkObj.userPhone, verifiedUserToken => {
            if (verifiedUserToken) {
              callback(200, checkObj);
            } else {
              callback(403, { error: 'Authentication failure !' });
            }
          });
        } else {
          callback(404, { error: 'Token not provided' });
        }
      } else {
        callback(500, { error: 'there was an error occurred in the server' });
      }
    });
  } else {
    callback(400, { error: 'Check ID is not provided' });
  }
};

// update
handler._check.put = (requestProperties, callback) => {
  const checkId =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id.trim()
      : false;

  let protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === 'string' &&
    ['get', 'post', 'put', 'delete'].indexOf(
      requestProperties.body.method?.toLowerCase().trim()
    ) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === 'object' &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    requestProperties.body.timeoutSeconds % 1 == 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  let tokenId =
    typeof requestProperties.headersObj.token === 'string'
      ? requestProperties.headersObj.token
      : false;

  if (checkId) {
    if (protocol || url || successCodes || method || timeoutSeconds) {
      data.read('checks', checkId, (err1, checkData) => {
        if (!err1 && checkData) {
          const checkObj = parseJSON(checkData);

          if (protocol) {
            checkObj.protocol = protocol;
          }

          if (method) {
            checkObj.method = method;
          }

          if (url) {
            checkObj.url = url;
          }

          if (successCodes) {
            checkObj.successCodes = successCodes;
          }

          if (timeoutSeconds) {
            checkObj.timeoutSeconds = timeoutSeconds;
          }

          verify(tokenId, checkObj.userPhone, isTokenVerified => {
            if (isTokenVerified) {
              data.update('checks', checkId, checkObj, err2 => {
                if (!err2) {
                  callback(200, checkObj);
                } else {
                  callback(500, {
                    error: 'There was a problem on the server !',
                  });
                }
              });
            } else {
              callback(403, { error: 'Authentication failure !' });
            }
          });
        } else {
          callback(500, { error: 'There was a problem on the server !' });
        }
      });
    } else {
      callback(400, { error: 'You must provide one field to update!' });
    }
  } else {
    callback(400, { error: 'check id is missing or wrong!' });
  }
};

// delete
handler._check.delete = (requestProperties, callback) => {
  const checkId =
    typeof requestProperties.queryStrObj.id === 'string' &&
    requestProperties.queryStrObj.id.trim().length === 20
      ? requestProperties.queryStrObj.id.trim()
      : false;

  const tokenId =
    typeof requestProperties.headersObj.token === 'string' &&
    requestProperties.headersObj.token.trim().length === 20
      ? requestProperties.headersObj.token.trim()
      : false;

  if (checkId) {
    data.read('checks', checkId, (err1, checkData) => {
      if (!err1 && checkData) {
        const checkObj = parseJSON(checkData);
        if (tokenId) {
          verify(tokenId, checkObj.userPhone, verifiedUserToken => {
            if (verifiedUserToken) {
              data.read('users', checkObj.userPhone, (err3, userData) => {
                if (!err3 && userData) {
                  const userObj = parseJSON(userData);
                  const userChecks =
                    typeof userObj.checks === 'object' &&
                    userObj.checks instanceof Array
                      ? userObj.checks
                      : [];
                  const checkIndex = userChecks.indexOf(checkId);

                  // a check must be listed in a user's 'checks' list
                  if (checkIndex > -1) {
                    userChecks.splice(checkIndex, 1);
                    userObj.checks = userChecks;
                    // update user info first
                    data.update('users', checkObj.userPhone, userObj, err4 => {
                      if (!err4) {
                        data.delete('checks', checkId, err2 => {
                          if (!err2) {
                            callback(200);
                          } else {
                            callback(500, {
                              error:
                                'could not delete check entry, server error !',
                            });
                          }
                        });
                      } else {
                        callback(500, {
                          error: "Could not update user's check data !",
                        });
                      }
                    });
                  }
                } else {
                  callback(500, { error: 'Could not read user data !' });
                }
              });
            } else {
              callback(403, { error: 'Authentication failure !' });
            }
          });
        } else {
          callback(404, { error: 'Token not provided' });
        }
      } else {
        callback(500, { error: 'there was an error occurred in the server' });
      }
    });
  } else {
    callback(400, { error: 'Check ID is not provided' });
  }
};

module.exports = handler;
