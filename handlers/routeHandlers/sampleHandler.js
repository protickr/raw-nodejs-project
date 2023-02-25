const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: 'you have reached sample handler !',
    });

};

module.exports = handler;
