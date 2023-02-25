// dependencies 
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');

// app object - module scaffolding 
const app = {};

// configuration object 
app.config = {
    port: 3000
};

// create server - function 
app.createServer = ()=>{
    const server = http.createServer(app.handleReqRes);

    server.listen(app.config.port, ()=>{
        console.log(`listening on port ${app.config.port}`);
    });
};

// request - response handler
app.handleReqRes = handleReqRes;

// start the server 
app.createServer();
