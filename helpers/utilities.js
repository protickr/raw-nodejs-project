// imortant utility function 

// dependencies
const crypto = require('crypto');
const environment = require('./environments');

// module scaffolding
const utilities = {};

utilities.parseJSON = (jsonStr) => {
    let output; 
    try{
        output = JSON.parse(jsonStr);
    }catch(err){
        console.log(err);
        output = {};
    }
    
    return output;
}

utilities.hash = (tobeEnc) => {
    if(typeof tobeEnc === 'string' && tobeEnc.length > 0){
        return crypto.createHmac('sha256', environment.secretKey).update(tobeEnc).digest('hex');
    }else{
        return false;
    }
};

module.exports = utilities;