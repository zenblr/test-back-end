const models = require('../models');
const request = require('request');

let verifyPANCard = async (pan , name, dob) => {
    try {
        const karzaDetail = await models.karzaDetails.findOne({
            where: {
                isActive: true, env: process.env.KARZA_ENV || 'TEST'
            }
        });

        let options = {
            method: 'POST',
            url: karzaDetail.panVerifyUrl,
            headers: {
                'x-karza-key': karzaDetail.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "consent": karzaDetail.consent, "pan": pan, "name" : name, "dob" : dob})
        }
        return new Promise((resolve, reject) => {

            request(options, async function (error, response, body) {
                var res = JSON.parse(body)
                if (res['status-code'] !== '101') {
                    await models.externalApiLogger.create({
                        apiType: "karza pan varify",
                        request: JSON.stringify({ "consent": karzaDetail.consent, "pan": pan, "name" : name, "dob" : dob }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.panUrl
                    });
                    return resolve({ error: true })
                } else if (error) {
                    await models.externalApiLogger.create({
                        apiType: "karza pan varify",
                        request: JSON.stringify({ "consent": karzaDetail.consent, "pan": pan, "name" : name, "dob" : dob }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.panUrl
                    });
                    return resolve({ error: true })
                } else if(res.status == 504){
                    await models.externalApiLogger.create({
                        apiType: "karza pan varify",
                        request: JSON.stringify({ "consent": karzaDetail.consent, "pan": pan, "name" : name, "dob" : dob }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.panUrl
                    });
                    return resolve({ error: true, status:res.status });
                }
                await models.externalApiLogger.create({
                    apiType: "karza pan varify",
                    request: JSON.stringify({ "consent": karzaDetail.consent, "pan": pan, "name" : name, "dob" : dob }),
                    response: JSON.stringify(res),
                    status: "success",
                    api: karzaDetail.panUrl
                });
                return resolve({ error: false, data: res.result });
            })
        });
    } catch (err) {
        await models.externalApiLogger.create({
            apiType: "karza pan varify",
            request: JSON.stringify({ "consent": karzaDetail.consent, "pan": pan, "name" : name, "dob" : dob }),
            response: JSON.stringify(res),
            status: "error",
            api: karzaDetail.panUrl
        });
        return { error: true, message: err }
    }
}

let getNameByPANCard = async (panCardNumber) => {
    try {
        const karzaDetail = await models.karzaDetails.findOne({
            where: {
                isActive: true, env: process.env.KARZA_ENV || 'TEST'
            }
        });

        let options = {
            method: 'POST',
            url: karzaDetail.panUrl,
            headers: {
                'x-karza-key': karzaDetail.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "consent": karzaDetail.consent, "pan": panCardNumber })
        }
        return new Promise((resolve, reject) => {

            request(options, async function (error, response, body) {
                var res = JSON.parse(body)
                if (res['status-code'] !== '101') {
                    await models.externalApiLogger.create({
                        apiType: "karza pan number",
                        request: JSON.stringify({ "consent": karzaDetail.consent, "pan": panCardNumber }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.panUrl
                    });
                    return resolve({ error: true })
                } else if (error) {
                    await models.externalApiLogger.create({
                        apiType: "karza pan number",
                        request: JSON.stringify({ "consent": karzaDetail.consent, "pan": panCardNumber }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.panUrl
                    });
                    return resolve({ error: true })
                } else if(res.status == 504){
                    await models.externalApiLogger.create({
                        apiType: "karza pan varify",
                        request: JSON.stringify({ "consent": karzaDetail.consent, "pan": panCardNumber }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.panUrl
                    });
                    return resolve({ error: true, status:res.status });
                }
                await models.externalApiLogger.create({
                    apiType: "karza pan number",
                    request: JSON.stringify({ "consent": karzaDetail.consent, "pan": panCardNumber }),
                    response: JSON.stringify(res),
                    status: "success",
                    api: karzaDetail.panUrl
                });
                return resolve({ error: false, data: res.result });
            })
        });
    } catch (err) {
        await models.externalApiLogger.create({
            apiType: "karza pan number",
            request: JSON.stringify({ "consent": karzaDetail.consent, "pan": panCardNumber }),
            response: JSON.stringify(res),
            status: "error",
            api: karzaDetail.panUrl
        });
        return { error: true, message: err }
    }
}

let verifyName = async (name) => {
    let karzaApiDetail;
    try {
        const karzaDetail = await models.karzaDetails.findOne({
            where: {
                isActive: true, env: process.env.KARZA_ENV || 'TEST'

            }
        });
        karzaApiDetail = karzaApiDetail
        const options = {
            method: 'POST',
            url: karzaDetail.nameUrl,
            headers: {
                'x-karza-key': karzaDetail.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "name1": name.name1, "name2": name.name2, "type": karzaDetail.type, "preset": karzaDetail.preset })
        };

        return new Promise((resolve, reject) => {
            request(options, async function (error, response, body) {
                var res = JSON.parse(body)
                if (res['statusCode'] !== 101) {
                    await models.externalApiLogger.create({
                        apiType: "karza name varify",
                        request: JSON.stringify({ "name1": name.name1, "name2": name.name2, "type": karzaDetail.type, "preset": karzaDetail.preset }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.nameUrl
                    });
                    return resolve({ error: true, status:res.status })
                } else if (error) {
                    await models.externalApiLogger.create({
                        apiType: "karza name varify",
                        request: JSON.stringify({ "name1": name.name1, "name2": name.name2, "type": karzaDetail.type, "preset": karzaDetail.preset }),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.nameUrl
                    });
                    return resolve({ error: true, status:res.status })
                } else if(res.status == 504){
                    await models.externalApiLogger.create({
                        apiType: "karza pan varify",
                        request: JSON.stringify({ "name1": name.name1, "name2": name.name2, "type": karzaDetail.type, "preset": karzaDetail.preset}),
                        response: JSON.stringify(res),
                        status: "error",
                        api: karzaDetail.panUrl
                    });
                    return resolve({ error: true, status:res.status });
                }
                await models.externalApiLogger.create({
                    apiType: "karza name varify",
                    request: JSON.stringify({ "name1": name.name1, "name2": name.name2, "type": karzaDetail.type, "preset": karzaDetail.preset }),
                    response: JSON.stringify(res),
                    status: "Success",
                    api: karzaDetail.nameUrl
                });
                let score = res.result.score * 100;
                let nameConfidence = karzaDetail.nameConfidence * 100;
                return resolve({ error: false, score, nameConfidence });
            })
        });
    } catch (err) {
        await models.externalApiLogger.create({
            apiType: "karza name varify",
            request: JSON.stringify({ "name1": name.name1, "name2": name.name2, "type": karzaApiDetail.type, "preset": karzaApiDetail.preset }),
            response: JSON.stringify(err),
            status: "error",
            api: karzaApiDetail.nameUrl
        });
        return err;
    }
}
module.exports = {
    verifyPANCard: verifyPANCard,
    verifyName: verifyName,
    getNameByPANCard:getNameByPANCard
}
