const request = require('request');

let sendSms = async (mobileNumber, message) => {
    let headers = {
        'content-type': 'application/json',
    };
    let dataString = await `{
        "ver": "1.0",
        "key": "b82KV6dOoMa4mkDGYsEpZw==",
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
        url: 'https://japi.instaalerts.zone/httpapi/JsonReceiver',
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
