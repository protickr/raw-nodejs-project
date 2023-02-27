const {sampleHandler} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");
const {userHandler} = require("./handlers/routeHandlers/userHandler");
const {tokenHandler} = require("./handlers/routeHandlers/tokenHandler");
const routes = {
    sample: sampleHandler,
    user: userHandler, 
    notfound: notFoundHandler,
    token: tokenHandler
}; 

module.exports = routes;
