// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

const server = {};

// create server - function
server.createServer = () => {
  const httpServer = http.createServer(server.handleReqRes);

  httpServer.listen(environment.port, () => {
    console.log(`Environment variable is, ${process.env.NODE_ENV}`);
    console.log(`listening on port ${environment.port}`);
  });
};

// request - response handler
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
  server.createServer();
};

module.exports = server;