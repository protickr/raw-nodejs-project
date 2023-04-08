const {sampleHandler} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");
const {userHandler} = require("./handlers/routeHandlers/userHandler");
const {tokenHandler} = require("./handlers/routeHandlers/tokenHandler");
const {checkHandler} = require("./handlers/routeHandlers/checkHandler");
const routes = {
    sample: sampleHandler,
    user: userHandler, 
    notfound: notFoundHandler,
    token: tokenHandler,
    check: checkHandler
}; 

module.exports = routes;
