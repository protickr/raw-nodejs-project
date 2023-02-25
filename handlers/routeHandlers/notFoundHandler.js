const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'The url was not found !'
    });
};

module.exports = handler;

