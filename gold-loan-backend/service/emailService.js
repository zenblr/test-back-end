const request = require('request')


exports.sendMail = async(reqBody) => {
    console.log(reqBody)
    return new Promise((resolve, reject) => {
        var email_data = {
            "personalizations": [{
                "to": [{
                    "email": `${reqBody.email}`,
                    "name": "Developer"
                }],
                "subject": "test"
            }],
            "from": {
                "email": 'rupesh@nimapinfotech.com',
                "name": 'Test Website'
            },
            "content": [{
                "type": "text/plain",
                "value": `${reqBody.data}`
            }]
        }

        var options = {
            method: 'POST',
            body: email_data,
            json: true,
            url: 'https://api.sendgrid.com/v3/mail/send',
            headers: {
                'Authorization': 'Bearer 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'
            }
        };

        request(options, function(error, response, body) {
            if (error) {
                reject(error);
                throw 'unable to send mail';
            } else {
                resolve(body);
            }
        });
    })
}