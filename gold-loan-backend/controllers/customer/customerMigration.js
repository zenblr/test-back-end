
const models = require('../../models')
const uniqid = require('uniqid');
let { getUserData, createCustomer } = require('../../service/digiGold')
const { getCustomerCityById, getCustomerStateById } = require('../../service/customerAddress')
const qs = require('qs');
const request = require('request');
const sequelize = models.sequelize;
const { pathToBase64 } = require('../../service/fileUpload')
const fs = require('fs');
const FormData = require('form-data');
const { ifError } = require('assert');

exports.customerMigration = async (req, res, next) => {
    // let data = await models.customer.findAll({ where: { isAugmontCustomerCreated: false } })
    // return res.status(200).json({ length: data.length, message: data })
    await models.customer.update({ cityId: 5762 }, { where: { cityId: 287 } })
    await models.customer.update({ userType: 'Individual' }, { where: { kyc_status: 'approved' } })
    customerCreate(req);
    return res.status(200).json({ message: 'success' })
}

let customerCreate = async (req) => {
    try {
        if (req.userData.id != 1) {
            return res.status(400).json({ message: 'unauthorized' })
        }
        let allCustomer
        if (req.body.allCustomer == undefined) {
            allCustomer = await models.customer.findAll({ where: { isAugmontCustomerCreated: false, merchantId: 1, isActive: true }, order: [['id', 'desc']] })
        } else {
            allCustomer = req.body.allCustomer
        }

        const getMerchantDetails = await models.merchant.findOne({
            where: { isActive: true, id: 1 },
            include: {
                model: models.digiGoldMerchantDetails,
                as: 'digiGoldMerchantDetails',
            }
        });

        const merchantData = {
            id: getMerchantDetails.id,
            merchantId: getMerchantDetails.digiGoldMerchantDetails.augmontMerchantId,
            accessToken: getMerchantDetails.digiGoldMerchantDetails.accessToken,
            expiresAt: getMerchantDetails.digiGoldMerchantDetails.expiresAt
        };

        for (let i = 0; i < allCustomer.length; i++) {
            const singleCustomer = allCustomer[i];
            let state = await getCustomerStateById(singleCustomer.stateId, null);
            let city = await getCustomerCityById(singleCustomer.cityId, null);

            if (city == null) {
                let checkAva = await models.customerAugmontCity.findOne({ where: { customerId: singleCustomer.id, cityId: singleCustomer.cityId } })
                if (checkAva == null) {
                    await models.customerAugmontCity.create({ customerId: singleCustomer.id, cityId: singleCustomer.cityId })
                }
                continue;
            }

            data = {
                'mobileNumber': singleCustomer.mobileNumber,
                'uniqueId': singleCustomer.customerUniqueId,
                'userName': singleCustomer.firstName + " " + singleCustomer.lastName,
                'userCity': city.cityUniqueCode,
                'userState': state.stateUniqueCode,
            }
            const options = {
                'method': 'POST',
                'url': `${process.env.DIGITALGOLDAPI}/merchant/v1/users`,
                'headers': {
                    'Authorization': `Bearer ${merchantData.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            const check = await checkCustomer(options);
            if (check.error) {
                if (!check.wrong) {
                    console.log(singleCustomer.id, "created")
                    await models.customer.update({ isAugmontCustomerCreated: true }, { where: { id: singleCustomer.id } })
                } else {
                    console.log(singleCustomer.id, "wrong")
                    models.createWrongInfo.create({ customerId: singleCustomer.id, error: check.body })
                    await models.customer.update({ isAugmontCustomerCreated: false }, { where: { id: singleCustomer.id } })
                }

            } else {
                console.log(singleCustomer.id, "newBanaya")
                await models.customer.update({ isAugmontCustomerCreated: true }, { where: { id: singleCustomer.id } })
            }
        }

        return
        // return res.status(200).json({ message: "success" })
    } catch (err) {
        console.log(err)
        return
        // return res.status(400).json({ message: err })
    }
}

// err.response.data.errors.uniqid[0].code == 4298

let checkCustomer = async (options) => {
    return new Promise((resolve, reject) => {
        request(options, async (err, response, body) => {
            if (err) {
                return resolve({ error: true })
            }
            const respBody = JSON.parse(body);
            if (respBody.statusCode === 201) {
                // console.log(singleCustomer.id)
                return resolve({ error: false })
            } else if (respBody && respBody.errors && respBody.errors.uniqueId && respBody.errors.uniqueId[0].code == 4298) {
                return resolve({ error: true })
            } else {
                return resolve({ error: true, wrong: true, body })
            }
        })
    })
}


exports.addKycDetailsInAugmont = async (req, res, next) => {

    createKyc(req)
    return res.status(200).json({ message: 'success' })
}


let createKyc = async (req) => {
    try {

        if (req.userData.id != 1) {
            return res.status(400).json({ message: 'unauthorized' })
        }

        const getMerchantDetails = await models.merchant.findOne({
            where: { isActive: true, id: 1 },
            include: {
                model: models.digiGoldMerchantDetails,
                as: 'digiGoldMerchantDetails',
            }
        });

        const merchantData = {
            id: getMerchantDetails.id,
            merchantId: getMerchantDetails.digiGoldMerchantDetails.augmontMerchantId,
            accessToken: getMerchantDetails.digiGoldMerchantDetails.accessToken,
            expiresAt: getMerchantDetails.digiGoldMerchantDetails.expiresAt
        };

        // await sequelize.transaction(async (t) => {

        let augmontCustomer
        if (req.body.allCustomer == undefined) {
            augmontCustomer = await models.customer.findAll({ where: { isAugmontCustomerCreated: true, merchantId: 1, isActive: true }, order: [['id', 'asc']] })
        } else {
            augmontCustomer = req.body.allCustomer
        }

        for (let i = 0; i < augmontCustomer.length; i++) {
            const singleCustomer = augmontCustomer[i];
            if (singleCustomer.kycStatus == "approved") {
                if (singleCustomer.panType == 'pan') {
                    //yahape unka kyc applied ka aayega
                    if (singleCustomer.panImage == null) {
                        console.log(singleCustomer.id, "pan Image null")
                        // await models.customer.update({ panImage: 'uploads/lead/1595235863488.png' }, { where: { id: singleCustomer.id } })
                    } else {
                        // await models.customer.update({ panImage: 'uploads/lead/1595235863488.png' }, { where: { id: singleCustomer.id } })
                        console.log(singleCustomer.id, "pan Image null nahi h")
                    }
                    let customer = await models.customer.findOne({ where: { id: singleCustomer.id } })
                    //change
                    let url;
                    let base64data;
                    let fullBase64Image;
                    let panPath;
                    console.log(process.env.NODE_ENV)
                    if (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "uat") {
                        url = process.env.BASE_URL + customer.panImage
                        const getAwsResp = await models.axios({
                            method: 'GET',
                            url: url,
                            responseType: 'arraybuffer'
                        });
                        base64data = Buffer.from(getAwsResp.data, 'binary').toString('base64');
                        fullBase64Image = `data:image/jpeg;base64,${base64data}`
                        panPath = process.env.BASE_URL + customer.panImage
                        // console.log(base64data)
                    } else {
                        url = customer.panImage

                        buff = fs.readFileSync(`public/${url}`);

                        base64data = buff.toString('base64');

                        fullBase64Image = `data:image/jpeg;base64,${base64data}`

                        base64data = fullBase64Image.split(';base64,').pop();

                        panPath = `public/uploads/digitalGoldKyc/pan-${customer.customerUniqueId}.jpeg`;

                    }
                    //change

                    // fs.writeFileSync(panPath, base64data, { encoding: 'base64' });
                    const data = new FormData();
                    data.append('panNumber', customer.panCardNumber);
                    // data.append('panAttachment', fs.createReadStream(panPath));
                    data.append('panAttachment', panPath);

                    const options = {
                        'method': 'POST',
                        'url': `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customer.customerUniqueId}/kyc`,
                        'headers': {
                            'Authorization': `Bearer ${merchantData.accessToken}`,
                            'Content-Type': 'application/json',
                            ...data.getHeaders(),
                        },
                        body: data
                    }
                    const check = await createCustomerKyc(options);
                    fs.unlinkSync(panPath)

                    if (check.error) {
                        console.log(check.error, "created")
                    } else {
                        console.log(check.error, "newBanaya")
                    }

                    console.log(i, singleCustomer.id, "approved", singleCustomer.panImage, "pan card h")


                    await models.customer.update({ scrapKycStatus: "approved", emiKycStatus: "approved", digiKycStatus: "approved", kycStatus: "approved" }, { where: { id: singleCustomer.id } })
                } else {
                    // console.log(i, singleCustomer.id, "approved", "pan card nahi h")

                }
            } else if (singleCustomer.kycStatus == "rejected" || singleCustomer.scrapKycStatus == "rejected") {
                console.log(i, singleCustomer.id, "rejected")

                await models.customer.update({ scrapKycStatus: "rejected", emiKycStatus: "rejected", digiKycStatus: "rejected", kycStatus: "rejected" }, { where: { id: singleCustomer.id } })

            } else if (singleCustomer.kycStatus == "pending") {
                if (singleCustomer.panType == 'pan') {
                    console.log(i, singleCustomer.id, "pending", "pan card h")
                    await models.customer.update({ digiKycStatus: 'waiting' }, { where: { id: singleCustomer.id } })
                    let checkAva = await models.digiKycApplied.findOne({ where: { customerId: singleCustomer.id } })
                    if (checkAva == null) {
                        await models.digiKycApplied.create({ customerId: singleCustomer.id, status: 'waiting' },)
                    }
                }
            }
        }

        // })

        return
    } catch (err) {
        console.log(err)
        return
    }
}
let createCustomerKyc = async (options) => {
    return new Promise((resolve, reject) => {
        request(options, async (err, response, body) => {
            if (err) {
                return resolve({ error: true })
            }
            const respBody = JSON.parse(body);
            console.log(respBody)
            if (respBody.statusCode === 200) {
                return resolve({ error: false })
            } else if (respBody.errors.status[0].code == 4548) {
                return resolve({ error: true })
            }

        })
    })
}