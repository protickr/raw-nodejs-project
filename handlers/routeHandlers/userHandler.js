// dependencies 
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');

const handler = {};

handler.userHandler = (requestProperties, callback) => {
    
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

// firstname, lastname, phonenumber, email password
handler._users.post = (requestProperties, callback) => {
    const requestBody = requestProperties.body;
    const firstName = typeof requestBody.firstName === 'string' && requestBody.firstName.trim().length > 0 ? requestBody.firstName: null;
    const lastName = typeof requestBody.lastName === 'string' && requestBody.lastName.trim().length > 0 ? requestBody.lastName: null;
    const phone = typeof requestBody.phone === 'string' && requestBody.phone.trim().length === 11 ? requestBody.phone: null;
    const password = typeof requestBody.password === 'string' && requestBody.password.trim().length > 0 ? requestBody.password: null;
    const tosAgreement = typeof requestBody.tosAgreement === 'boolean' && requestBody.tosAgreement;
    console.log(firstName, lastName, phone, password, tosAgreement);

    if(firstName && lastName && phone && password && tosAgreement){
        // check if user exists
        data.read('users', phone, (err1, user)=>{
            if(err1){
                let userObject = {
                    firstName, 
                    lastName, 
                    phone, 
                    'password': hash(password),
                    tosAgreement
                };

                // store the user to db
                data.create('users', phone, userObject, (err2) => {
                    if(!err2) {
                        callback(200, {'message': 'User was created successfully !'});
                    } else {
                        callback(500, {'error': 'Could not create user'});
                    }
                });
                
            } else {
                callback(400, {
                    error: 'user already exists! ',
                });
            }
        });

    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    } 
};

handler._users.get = (requestProperties, callback) => {
    callback(200);
};

handler._users.put = (requestProperties, callback) => {

};

handler._users.delete = (requestProperties, callback) => {};

module.exports = handler;
