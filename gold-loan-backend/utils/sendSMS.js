const request = require('request');
const models = require('../models');

let sendSms = async (mobileNumber, message, smsFrom) => {
    if(!smsFrom){
        smsFrom = "admin"
    }
    const getSmsCredential = await models.loanSmsCredential.findOne({where:{isActive:true, smsFrom}});
    let headers = {
        'content-type': 'application/json',
    };
    let dataString = await `{
        "ver": "1.0",
        "key": "${getSmsCredential.key}",
        "encrpt": "0",
        "messages"
            : [
                {
                    "dest": [91${mobileNumber}],
                    "text": "${message}",
                    "send": "AUGMNT",
                    "dcs": "0",
                    "udhi_inc": "0",
                    "dlr_req": "1",
                    "app_country": "1",
                    "cust_ref": "123"
                }
            ]
    }`;
    const options = {
        url: getSmsCredential.url,
        method: 'POST',
        headers: headers,
        body: dataString
    };

    let response = await request(options);
    return response;
}

module.exports = {
    sendSms: sendSms
}
