const environments = {};

environments.staging = {
    port: 8000,
    envName: 'staging', 
    secretKey: 'asldkfjalskdjflaskdjf', 
    maxChecks: 5, 
    twilio: {
        fromPhone: '+15076323016',
        accountSid: 'ACfae14a6a350f53d67b61999d430fe3ec', 
        authToken: '7e57a79f256399eb7b38deb55a7300e5',
    },
};

environments.production = {
    port: 4000,
    envName: 'production',
    secretKey: 'asldkfjalskdjflaskdjf', 
    maxChecks: 5,
    twilio: {
        fromPhone: '+15076323016',
        accountSid: 'ACfae14a6a350f53d67b61999d430fe3ec', 
        authToken: '7e57a79f256399eb7b38deb55a7300e5',
    },
};

// determine which environment was passed at application startup
const currentEnvironment = typeof (process.env.NODE_ENV) === "string" ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? 
environments[currentEnvironment] 
: environments.staging

module.exports = environmentToExport; 
