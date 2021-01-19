
const models = require('../../models')
const uniqid = require('uniqid');
let { getUserData, createCustomer } = require('../../service/digiGold')
const { getCustomerCityById, getCustomerStateById } = require('../../service/customerAddress')
const qs = require('qs');
const request = require('request');
const sequelize = models.sequelize;

exports.customerMigration = async (req, res, next) => {
    try {
        if (req.userData.id != 1) {
            return res.status(400).json({ message: 'unauthorized' })
        }
        let allCustomer
        if (req.body.allCustomer == undefined) {
            allCustomer = await models.customer.findAll({ where: { merchantId: 1, isActive: true }, order: [['id', 'asc']] })
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
                models.customerAugmontCity.create({ customerId: singleCustomer.id, cityId: singleCustomer.cityId })
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
                console.log(singleCustomer.id, "created")
                models.customer.update({ isAugmontCustomerCreated: true }, { where: { id: singleCustomer.id } })
            } else {
                console.log(singleCustomer.id, "newBanaya")
                models.customer.update({ isAugmontCustomerCreated: true }, { where: { id: singleCustomer.id } })
            }
        }



        await sequelize.transaction(async (t) => {
            let augmontCustomer = await models.customer.findAll({ where: { merchantId: 1, isActive: true, isAugmontCustomerCreated: true }, order: [['id', 'asc']] })
            for (let i = 0; i < augmontCustomer.length; i++) {
                const singleCustomer = augmontCustomer[i];
                if (singleCustomer.kycStatus == "approved") {
                    if (singleCustomer.panCardNumber != null) {
                        console.log(i, singleCustomer.id, "approved", singleCustomer.panImage, "pan card h")
                        //yahape unka kyc applied ka aayega

                        // await models.customer.update({ scrapKycStatus: "approved", emiKycStatus: "approved", digiKycStatus: "approved", kycStatus: "approved" }, { where: { id: singleCustomer.id }, transaction: t })
                    } else {
                        console.log(i, singleCustomer.id, "approved", "pan card nahi h")

                    }
                } else if (singleCustomer.kycStatus == "rejected" || singleCustomer.scrapKycStatus == "rejected") {
                    console.log(i, singleCustomer.id, "rejected")

                    // await models.customer.update({ scrapKycStatus: "rejected", emiKycStatus: "rejected", digiKycStatus: "rejected", kycStatus: "rejected" }, { where: { id: singleCustomer.id }, transaction: t })

                } else if (singleCustomer.kycStatus == "pending") {

                    if (singleCustomer.panCardNumber != null) {
                        console.log(i, singleCustomer.id, "pending", "pan card h")
                        // await models.customer.update({ digiKycStatus: 'waiting' }, { where: { id: singleCustomer.id }, transaction: t })
                        // await models.digiKycApplied.create({ customerId: singleCustomer.id, status: 'waiting' }, { transaction: t })
                    } else {
                        console.log(i, singleCustomer.id, "pending", "pan card nahi h")

                    }
                }
            }

        })

        return res.status(200).json({ message: "success" })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err })
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
            } else if (respBody.errors.uniqueId[0].code == 4298) {
                return resolve({ error: true })
            }
        })
    })
}
