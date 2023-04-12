// dependencies 
const url = require('url');
const data = require('./data');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notifications');

// module scaffolding 
const worker = {};

worker.alertUserToStateChange = newChkObj => {
  const message = `Alert: Your check for ${newChkObj.method.toUpperCase()} ${newChkObj.protocol}://${newChkObj.url} is currently ${newChkObj.state}`;

  sendTwilioSms(newChkObj.userPhone, message, error => {
    if (!error) {
      console.log('message sent successfully');
    } else {
      console.log(error);
    }
  });
};

worker.logCheckOutcome = (checkObj, checkOutcome) => {
  const updatedCheckObj = checkObj;
  const state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    checkObj.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? 'up'
      : 'down';
  const alertWanted =
    checkObj.lastChecked && checkObj.state !== state ? true : false;

  updatedCheckObj.lastChecked = Date.now();
  updatedCheckObj.state = state;

  // store updated check object
  data.update('checks', checkObj.id, updatedCheckObj, err1 => {
    if (!err1) {
      // send alert if wanted
      if(alertWanted)
        worker.alertUserToStateChange(updatedCheckObj);
    } else {
      console.log('Error trying to save check data of one of the checks!');
    }
  });
};


worker.performCheck = (validatedCheckObj) => {
    const checkObj = validatedCheckObj;
    const checkOutcome = {
        responseCode: false, 
        error: false
    };
    let outcomeSent = false;

    // parse the hostname 
    const parsedUrl = url.parse(`${checkObj.protocol}://${checkObj.url}`, true);
    const hostName = parsedUrl.hostname; 
    const path = parsedUrl.path;

    // construct the request
    const requestDetails = {
        'protocol': `${checkObj.protocol}:`, 
        'method': checkObj.method.toUpperCase(), 
        'hostname': hostName,
        'path': path, 
        'timeout': checkObj.timeoutSeconds * 1000
    };

    const protocolToUse = checkObj.protocol === 'http' ? http : https; 

    let req = protocolToUse.request(requestDetails, res => {
      const status = res.statusCode;
      console.log(checkObj.url, status, checkObj, checkOutcome);

      // update the check status
      if (!outcomeSent) {
        checkOutcome.error = false;
        checkOutcome.responseCode = status;
        worker.logCheckOutcome(checkObj, checkOutcome);
        outcomeSent = true;
      }
    });


    req.on('error', err => {
      if(!outcomeSent){
        checkOutcome.error = true;
        checkOutcome.responseCode = err.message;
        worker.logCheckOutcome(checkObj, checkOutcome);
        outcomeSent = true;
        console.log(err.message);
      }
    });
    req.on('timeout', err => {
        if(!outcomeSent){
            checkOutcome.error = true; 
            checkOutcome.responseCode = 'request timeout';        
            worker.logCheckOutcome(checkObj, checkOutcome);
            outcomeSent = true;
            console.log('request timeout');
          }
    });

    req.end();
};



worker.validateCheckData = (originalCheckObj) => {
    const checkObj = originalCheckObj;

    if(!checkObj || !checkObj.id){
        return console.log(`Invalid check data !`);
    }

    checkObj.state =
      typeof checkObj.state === 'string' &&
      ['up', 'down'].indexOf(checkObj.state) > -1
        ? checkObj.state
        : 'down';

    checkObj.lastChecked =
      typeof checkObj.lastChecked === 'number' && checkObj.lastChecked > 0
        ? checkObj.lastChecked
        : false;

    // process the check 
    worker.performCheck(checkObj);
};



// look up all the checks from file db
worker.gatherAllChecks = () => {
    data.list('checks', (err1, checksListOrErrorMsg)=>{
        if(!err1){
            checksListOrErrorMsg.forEach((checkFileName, index, wholeArr)=>{

                data.read('checks', checkFileName, (err2, checkData)=>{
                    if(!err2 && checkData && checkData.length > 0 ){
                        const checkDataObj = parseJSON(checkData);
                        // validate check data before processing
                        const validatedCheck = worker.validateCheckData(checkDataObj);
                    }else{
                        console.log(`Error reading checks from file, ${checkFileName} error, ${err2}`);
                    }
                });

            });
        }else{
            console.log(`Can not find any checks to process, ${checksListOrErrorMsg}`);
        }
    });
};



// timer to execute the worker process once per minute 
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};



worker.init = () => {
    // execute all the check at start
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop();
};




module.exports = worker;
