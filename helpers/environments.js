const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging', 
    secretKey: 'asldkfjalskdjflaskdjf', 
};

environments.production = {
    port: 4000,
    envName: 'production',
    secretKey: 'asldkfjalskdjflaskdjf', 
};

// determine which environment was passed at application startup
const currentEnvironment = typeof (process.env.NODE_ENV) === "string" ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? 
environments[currentEnvironment] 
: environments.staging

module.exports = environmentToExport; 
