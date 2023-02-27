// dependencies 
const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {notFoundHandler} = require('../handlers/routeHandlers/notFoundHandler');
const {parseJSON} = require('../helpers/utilities');
// handle request response
const handler = {};

handler.handleReqRes = (req, res) => {
    // parse request 
    // request parameters
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const queryStrObj = parsedUrl.query;
    const method = req.method.toLowerCase();
    const headersObj = req.headers;
    const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');
    const requestProperties = {
        pathName, 
        queryStrObj, 
        method, 
        headersObj, 
        trimmedPath,
    };

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;
    

    // rquest body - is a stream of buffers
    let realData = '';
    const decoder = new StringDecoder();

    // listen to data events 
    const payLoad = [];
    req.on('data', (buffer)=>{
        realData += decoder.write(buffer);    
    });
    
    // process all data on end
    req.on('end', ()=>{
        realData += decoder.end();
        requestProperties.body = parseJSON(realData);
        chosenHandler(requestProperties, (statusCode, payLoad)=>{
            statusCode = typeof statusCode === 'number' ? statusCode : '500';
            payLoad = typeof payLoad === 'object' ? payLoad : {};
            
            const payLoadString = JSON.stringify(payLoad);
            
            // return the final response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payLoadString);
        });
    });
    
};

module.exports = handler;