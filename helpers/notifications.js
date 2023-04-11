// notification ilbrary
// importantt functions to notifiy users

// dependencies `
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');
const { parseJSON } = require('./utilities');

const notifications = {};

// send sms to user using twilio API
notifications.sendTwilioSms = function (phone, msg, callback) {
  const userPhone =
    typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    // configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the https request details
    //TODO https request details object always requires 'path' NOT URL
    const requestDetails = {
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    //instantiate the request object
    const req = https.request(requestDetails, res => {
      const status = res.statusCode;
      const chunks = [];

      res.on('data', data => {
        chunks.push(data);
      });

      res.on('end', () => {
        const wholeRes = Buffer.concat(chunks)?.toString();
        // on end of response
        if (status === 200 || status === 201) {
          const resJSON = parseJSON(wholeRes);
          // console.log(resJSON);
          callback(false);
        } else {
          // console.log('\nTwilio send-message error xml: \n' + wholeRes + '\n');
          callback(`status code returned was ${status}`);
        }
      });
    });

    req.on('error', e => {
      callback(e);
    });

    req.write(stringifyPayload); // bind the payload to request
    req.end(); // to actually send the request
  } else {
    callback('given parameters were missing or invalid');
  }
};

module.exports = notifications;
