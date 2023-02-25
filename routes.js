const {sampleHandler} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");

const routes = {
    sample: sampleHandler,
    notfound: notFoundHandler,
};

module.exports = routes;
