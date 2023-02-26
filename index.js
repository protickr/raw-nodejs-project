// dependencies 
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data');
// app object - module scaffolding 
const app = {};

// testing file system 
// create file
// data.create('test', 'newFile', {'name': 'Bangladesh', 'language': 'Bangla'}, (err)=>{
//     console.log('error was', err);
// });

// read file  
// data.read('test', 'newFile', (err, result)=>{
//     console.log(err, result);
// });

// update file  
// data.update('test', 'newFile', {'name':'England', 'Language': 'English'},(err)=>{
//     console.log(err);
// });

// delete file 
// data.delete('test', 'newFile', (err)=>{
//     console.log(err);
// });

// create server - function 
app.createServer = ()=>{
    const server = http.createServer(app.handleReqRes);

    server.listen(environment.port, ()=>{
        console.log(`Environment variable is, ${process.env.NODE_ENV}`);
        console.log(`listening on port ${environment.port}`);
    });
};

// request - response handler
app.handleReqRes = handleReqRes;

// start the server 
app.createServer();
