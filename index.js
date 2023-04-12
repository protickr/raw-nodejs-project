// dependencies 
const server = require('./lib/server');
const worker = require('./lib/worker');

// app object - module scaffolding 
const app = {};

app.init = () => {
    // start the server 
    server.init();

    // start background workers
    worker.init();
};

app.init();

module.exports = app;







/* *********    Background tests' source codes  ************ */
// const data = require('./lib/data');
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


// const { sendTwilioSms } = require('./helpers/notifications');
// sendTwilioSms('', 'This is a test message', (err)=>{
//     if(!err){
//         console.log('message sent successfully');
//     }else{
//         console.log(err);
//     }
// });
