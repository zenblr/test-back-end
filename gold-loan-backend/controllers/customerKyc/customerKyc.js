const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");
const { paginationWithFromTo } = require("../../utils/pagination");
const { VIEW_ALL_CUSTOMER } = require('../../utils/permissionCheck')

const check = require("../../lib/checkLib");


exports.getCustomerDetails = async (req, res, next) => {
    let { mobileNumber, moduleId } = req.body
    let numberExistInCustomer = await models.customer.findOne({ where: { mobileNumber }, 
    include: {
        model: models.customerKyc,
            as: 'customerKyc'
    } });
    if (check.isEmpty(numberExistInCustomer)) {
        return res.status(404).json({ message: "Your Mobile number does not exist, please add lead first" });
    }

    if(!check.isEmpty(numberExistInCustomer.customerKyc)){
        let currentModuleId = numberExistInCustomer.customerKyc.currentKycModuleId ;

        if(currentModuleId != moduleId){
            if(moduleId == 1){
                if(numberExistInCustomer.scrapKycStatus != "approved"){
                    return res.status(404).json({ message: "kindly complete scrap kyc" });
                }
            }
            if(moduleId == 3){
                if(numberExistInCustomer.kycStatus != "approved" ){
                    return res.status(404).json({ message: "kindly complete loan kyc" });
                }
            }
        }

    }

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return res.status(404).json({ message: "Status confirm is not there in status table" });
    }
    let statusId = status.id

    let checkStatusCustomer = await models.customer.findOne({
        where: { statusId, id: numberExistInCustomer.id },
        attributes: ['firstName', 'lastName', 'panCardNumber', 'panType', 'panCardNumber', 'panImage', 'userType', 'moduleId', 'organizationTypeId', 'dateOfIncorporation', 'scrapKycStatus'],
        include: [{
            model: models.organizationType,
            as: "organizationType",
            attributes: ['id', 'organizationType']
        },
        {
            model: models.customerKycAddressDetail,
            as: 'customerKycAddress',
            attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
            include: [{
                model: models.state,
                as: 'state'
            }, {
                model: models.city,
                as: 'city'
            }, {
                model: models.addressProofType,
                as: 'addressProofType'
            }],
            order: [["id", "ASC"]]
        },
        {
            model: models.customerKycOrganizationDetail,
            as: "organizationDetail",
            attributes: ['customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate']
        },
        {
            model: models.customerKycPersonalDetail,
            as: 'customerKycPersonal',
            attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
            include: [{
                model: models.occupation,
                as: 'occupation'
            }, {
                model: models.identityType,
                as: 'identityType'
            }]
        }
    ]
    })

    //check kyc status  scrap == approve 
    // check user type == corporate == you cant apply loan == due to corporeate kyc

    if(checkStatusCustomer.scrapKycStatus == "approved"){
        if(checkStatusCustomer.userType == "Corporate"){
            return res.status(400).json({ message: "Please create new customer since you have completed Corporate kyc" });
        }   
    }

    if (check.isEmpty(checkStatusCustomer)) {
        return res.status(400).json({ message: "Please proceed after confirm your lead stage status" });
    }
    return res.status(200).json({ message: "Success", customerInfo: checkStatusCustomer });
}


exports.submitCustomerKycinfo = async (req, res, next) => {

        let { firstName, lastName, mobileNumber, panCardNumber, panType, panImage, moduleId, organizationTypeId, dateOfIncorporation, userType } = req.body;

        console.log(userType);

        let status = await models.status.findOne({ where: { statusName: "confirm" } })
        if (check.isEmpty(status)) {
            return res.status(404).json({ message: "Status confirm is not there in status table" });
        }
        let statusId = status.id
        let getCustomerInfo = await models.customer.findOne({
            where: { mobileNumber: mobileNumber, statusId },
            attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId', 'pinCode', 'panType', 'panImage'],
        })
        if (panCardNumber) {
            let findPanCardNumber = await models.customer.findOne({
                where: {
                    id: { [Op.not]: getCustomerInfo.id },
                    panCardNumber: { [Op.iLike]: panCardNumber },
                    isActive: true
                }
            });
            if (!check.isEmpty(findPanCardNumber)) {
                return res.status(400).json({ message: "Pan Card Number already exists! " })
            }
        }


        if (check.isEmpty(getCustomerInfo)) {
            return res.status(404).json({ message: "Your status is not confirm" });
        }
        let findCustomerKyc = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id,isKycSubmitted: true}});

        if (findCustomerKyc && findCustomerKyc.isKycSubmitted == true && moduleId == 1) {
            return res.status(404).json({ message: "This customer Kyc is already submitted." });
        }

        let findCustomerScrapKyc = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id,isScrapKycSubmitted: true}});
        if (findCustomerScrapKyc && findCustomerScrapKyc.isScrapKycSubmitted == true && moduleId == 3) {
            return res.status(404).json({ message: "This customer Kyc is already submitted." });
        }

        let KycStage = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id } })

        if (!check.isEmpty(KycStage)) {
            let name
            if (KycStage.customerKycCurrentStage == "2") {

                let { id, stateId, cityId, pinCode } = await models.customer.findOne({ where: { id: KycStage.customerId, isActive: true } });

                return res.status(200).json({
                    customerId: KycStage.customerId,
                    customerKycId: KycStage.id,
                    customerKycCurrentStage: KycStage.customerKycCurrentStage,
                    stateId: stateId,
                    cityId: cityId,
                    pinCode: pinCode,
                    moduleId: moduleId,
                    userType: userType
                })

            } else if (KycStage.customerKycCurrentStage == "3") {

                if (moduleId == 1) {
                    let { firstName, lastName } = await models.customerKycPersonalDetail.findOne({ where: { customerId: KycStage.customerId } })
                    name = `${firstName} ${lastName}`;

                    return res.status(200).json({
                        customerId: KycStage.customerId,
                        customerKycId: KycStage.id,
                        name,
                        customerKycCurrentStage: KycStage.customerKycCurrentStage,
                        moduleId: moduleId,
                        userType: userType

                    })
                } else if (moduleId == 3) {
                    if (userType == "Individual") {
                        let { firstName, lastName } = await models.customerKycPersonalDetail.findOne({ where: { customerId: KycStage.customerId } })
                        name = `${firstName} ${lastName}`;

                        return res.status(200).json({
                            customerId: KycStage.customerId,
                            customerKycId: KycStage.id,
                            name,
                            customerKycCurrentStage: KycStage.customerKycCurrentStage,
                            moduleId: moduleId,
                            userType: userType

                        })
                    } else {
                        return res.status(200).json({
                            customerId: KycStage.customerId,
                            customerKycId: KycStage.id,
                            customerKycCurrentStage: KycStage.customerKycCurrentStage,
                            moduleId: moduleId,
                            userType: userType
                        })
                    }
                }

            } else if (KycStage.customerKycCurrentStage == "4") {
                let customerKycReview = await models.customer.findOne({
                    where: { id: KycStage.customerId },
                    attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage', 'userType', 'organizationTypeId', 'dateOfIncorporation'],
                    include: [{
                        model: models.customerKycPersonalDetail,
                        as: 'customerKycPersonal',
                        required: false,
                        attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
                        include: [{
                            model: models.occupation,
                            as: 'occupation'
                        }, {
                            model: models.identityType,
                            as: 'identityType'
                        }]
                    }, {
                        model: models.customerKycAddressDetail,
                        as: 'customerKycAddress',
                        attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
                        include: [{
                            model: models.state,
                            as: 'state'
                        }, {
                            model: models.city,
                            as: 'city'
                        }, {
                            model: models.addressProofType,
                            as: 'addressProofType'
                        }],
                        order: [["id", "ASC"]]
                    },
                    {
                        model: models.customerKycOrganizationDetail,
                        as: 'organizationDetail',
                        required: false,
                        attributes: ['customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate']
                    },
                    {
                        model: models.organizationType,
                        as: "organizationType",
                        attributes: ['id', 'organizationType']
                    },
                ]
                })
                return res.status(200).json({
                    customerId: KycStage.customerId,
                    customerKycId: KycStage.id,
                    customerKycCurrentStage: KycStage.customerKycCurrentStage,
                    customerKycReview,
                    moduleId: moduleId,
                    userType: userType

                })

            }
        }


        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;
        let kyc = await sequelize.transaction(async (t) => {

            let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerId: getCustomerInfo.id, createdBy, modifiedBy, customerKycCurrentStage: "2", currentKycModuleId: moduleId  }, { transaction: t })

            await models.customer.update({ firstName: firstName, lastName: lastName, panCardNumber: panCardNumber, panType: panType, panImage: panImage, organizationTypeId, dateOfIncorporation, userType: userType, moduleId: moduleId }, { where: { id: getCustomerInfo.id }, transaction: t })
            let createCustomerKyc
            let createOrganizationDetail
            if (moduleId == 3) {
                if (userType == "Corporate") {
                    createOrganizationDetail = await models.customerKycOrganizationDetail.create({
                        customerId: getCustomerInfo.id,
                        customerKycId: customerKycAdd.id,
                        createdBy,
                        modifiedBy,
                    }, { transaction: t });
                } else {
                    createCustomerKyc = await models.customerKycPersonalDetail.create({
                        customerId: getCustomerInfo.id,
                        customerKycId: customerKycAdd.id,
                        firstName: firstName,
                        lastName: lastName,
                        panCardNumber: panCardNumber,
                        createdBy,
                        modifiedBy,
                    }, { transaction: t });
                }

            }
            if (moduleId == 1) {
                createCustomerKyc = await models.customerKycPersonalDetail.create({
                    customerId: getCustomerInfo.id,
                    customerKycId: customerKycAdd.id,
                    firstName: firstName,
                    lastName: lastName,
                    panCardNumber: panCardNumber,
                    createdBy,
                    modifiedBy,
                }, { transaction: t });
            }

            return customerKycAdd
        })

        return res.status(200).json({
            customerId: getCustomerInfo.id,
            customerKycId: kyc.id,
            customerKycCurrentStage: kyc.customerKycCurrentStage,
            stateId: getCustomerInfo.stateId,
            cityId: getCustomerInfo.cityId,
            pinCode: getCustomerInfo.pinCode,
            moduleId: moduleId,
            userType: userType

        })
}


exports.submitCustomerKycAddress = async (req, res, next) => {

        let { customerId, customerKycId, identityProof, identityTypeId, identityProofNumber, address, moduleId, userType } = req.body
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;

        let name;
        let customerDetail
        if (moduleId == 1) {
            if (identityProof.length == 0) {
                return res.status(404).json({ message: "Identity proof file must be required." });
            }
            let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
            if (!check.isEmpty(findIdentityNumber)) {
                return res.status(400).json({ message: "Identity Proof Number already exists! " })
            }
            customerDetail = await models.customerKycPersonalDetail.findOne({ where: { customerKycId: customerKycId } })
            name = `${customerDetail.firstName} ${customerDetail.lastName}`;
        }

        // if (identityProof.length == 0) {
        //     return res.status(404).json({ message: "Identity proof file must be required." });
        // }
        if (moduleId == 1) {
            if (address[0].addressProof.length == 0 || address[1].addressProof.length == 0) {
                return res.status(404).json({ message: "Address proof file must be required." });
            }
        } else if (moduleId == 3) {
            if (userType == "Individual") {
                if (address[0].addressProof.length == 0) {
                    return res.status(404).json({ message: "Address proof file must be required." });
                }
            }
            if (userType == "Corporate") {
                if (address[0].addressProof.length == 0 || address[1].addressProof.length == 0) {
                    return res.status(404).json({ message: "Address proof file must be required." });
                }
            }

        }

        let findCustomerKyc = await models.customerKycAddressDetail.findOne({ where: { customerKycId: customerKycId } })

        if (!check.isEmpty(findCustomerKyc)) {
            return res.status(404).json({ message: "This customer address details is already filled." });
        }

        // let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
        // if (!check.isEmpty(findIdentityNumber)) {
        //     return res.status(400).json({ message: "Identity Proof Number already exists! " })
        // }


        let addressArray = []
        for (let i = 0; i < address.length; i++) {

            address[i]['customerId'] = customerId
            address[i]['customerKycId'] = customerKycId
            address[i]['createdBy'] = createdBy
            address[i]['modifiedBy'] = modifiedBy
            addressArray.push(address[i])
        }

        // let customerDetail = await models.customerKycPersonalDetail.findOne({ where: { customerKycId: customerKycId } })
        // let name = `${customerDetail.firstName} ${customerDetail.lastName}`;

        await sequelize.transaction(async t => {
            if (moduleId == 1) {
                await models.customerKycPersonalDetail.update({
                    identityProof: identityProof,
                    identityTypeId: identityTypeId,
                    identityProofNumber: identityProofNumber,
                    modifiedBy: modifiedBy
                }, { where: { customerId: customerId }, transaction: t });

                await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "3" }, { where: { customerId }, transaction: t });
                await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

            } else {

                // if(identityTypeId == 2){
                //     await models.customerKycPersonalDetail.update({
                //         identityProof: identityProof,
                //         identityTypeId: identityTypeId,
                //         identityProofNumber: identityProofNumber,
                //         modifiedBy: modifiedBy
                //     }, { where: { customerId: customerId }, transaction: t });
                // }

                await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "3" }, { where: { customerId }, transaction: t });
                await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });
            }
            // await models.customerKycPersonalDetail.update({
            //     identityProof: identityProof,
            //     identityTypeId: identityTypeId,
            //     identityProofNumber: identityProofNumber,
            //     modifiedBy: modifiedBy
            // }, { where: { customerId: customerId }, transaction: t });

            // await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "3" }, { where: { customerId }, transaction: t });
            // await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

        })

        let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

        return res.status(200).json({ customerId, customerKycId, name, customerKycCurrentStage, moduleId, userType })
}


exports.submitCustomerKycPersonalDetail = async (req, res, next) => {

        let { customerId, customerKycId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, email, alternateEmail, landLineNumber, gstinNumber, cinNumber, constitutionsDeed, gstCertificate, moduleId, userType } = req.body

        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;

        let customer = await models.customer.findOne({ where: { id: customerId } })

        if (moduleId == 1) {

            if (customer.mobileNumber == alternateMobileNumber) {
                return res.status(400).json({ message: "Your alternate Mobile number is same as your previous Mobile number " });
            }
            let findAlternateNumberExist = await models.customerKycPersonalDetail.findOne({ where: { alternateMobileNumber } })

            if (!check.isEmpty(findAlternateNumberExist)) {
                return res.status(400).json({ message: "Your alternate Mobile number is already exist." });
            }
        } else if (moduleId == 3) {

            if (userType == "Corporate") {
                let customerEmail = await models.customer.findOne({ where: { email } });

                let customerOrganizationEmail = await models.customerKycOrganizationDetail.findOne({ where: { email } });

                if (!check.isEmpty(customerEmail) || !check.isEmpty(customerOrganizationEmail)) {
                    return res.status(400).json({ message: "your email id is already exists." });
                }

                if (alternateEmail) {

                    if(email == alternateEmail){
                        return res.status(400).json({ message: "your email id and alternate email id is same." });
                    }

                    let customerAlternateEmail = await models.customer.findOne({ where: { email: alternateEmail } });

                    let customerOrganizationAlternateEmail = await models.customerKycOrganizationDetail.findOne({ where: { alternateEmail } });

                    let customerOrganizationEmailVerify = await models.customerKycOrganizationDetail.findOne({ where: { email: alternateEmail } });

                    if (!check.isEmpty(customerAlternateEmail) || !check.isEmpty(customerOrganizationAlternateEmail) || !check.isEmpty(customerOrganizationEmailVerify)) {
                        return res.status(400).json({ message: "your alternate email id is already exists." });
                    }
                }

                if (landLineNumber) {
                    let customerLandline = await models.customerKycOrganizationDetail.findOne({ where: { landLineNumber } });

                    if (!check.isEmpty(customerLandline)) {
                        return res.status(400).json({ message: "your land line number is already exists." });
                    }
                }
            }
        }


        await sequelize.transaction(async t => {
            let details;
            if (moduleId == 1) {
                details = await models.customerKycPersonalDetail.update({
                    profileImage: profileImage,
                    dateOfBirth: dateOfBirth,
                    alternateMobileNumber: alternateMobileNumber,
                    gender: gender,
                    age: age,
                    martialStatus: martialStatus,
                    occupationId: occupationId,
                    spouseName: spouseName,
                    signatureProof: signatureProof,
                    modifiedBy: modifiedBy
                }, { where: { customerId: customerId }, transaction: t });
            } else if (moduleId == 3) {
                if (userType == "Individual") {
                    details = await models.customerKycPersonalDetail.update({
                        profileImage: profileImage,
                        dateOfBirth: dateOfBirth,
                        alternateMobileNumber: alternateMobileNumber,
                        gender: gender,
                        age: age,
                        martialStatus: martialStatus,
                        occupationId: occupationId,
                        spouseName: spouseName,
                        signatureProof: signatureProof,
                        modifiedBy: modifiedBy
                    }, { where: { customerId: customerId }, transaction: t });
                }
                if (userType == "Corporate") {
                    details = await models.customerKycOrganizationDetail.update({
                        email: email,
                        alternateEmail: alternateEmail,
                        landLineNumber: landLineNumber,
                        gstinNumber: gstinNumber,
                        cinNumber: cinNumber,
                        constitutionsDeed: constitutionsDeed,
                        gstCertificate: gstCertificate,
                        modifiedBy: modifiedBy
                    }, { where: { customerId: customerId }, transaction: t });
                }

            }

            await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "4" }, { where: { customerId }, transaction: t });

        })

        let customerKycReview;
        if (moduleId == 1) {
            customerKycReview = await models.customer.findOne({
                where: { id: customerId },
                attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage'],
                include: [{
                    model: models.customerKycPersonalDetail,
                    as: 'customerKycPersonal',
                    attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
                    include: [{
                        model: models.occupation,
                        as: 'occupation'
                    }, {
                        model: models.identityType,
                        as: 'identityType'
                    }]
                }, {
                    model: models.customerKycAddressDetail,
                    as: 'customerKycAddress',
                    attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
                    include: [{
                        model: models.state,
                        as: 'state'
                    }, {
                        model: models.city,
                        as: 'city'
                    }, {
                        model: models.addressProofType,
                        as: 'addressProofType'
                    }],
                    order: [["id", "ASC"]]
                }]
            })
        } else if (moduleId == 3) {
            customerKycReview = await models.customer.findOne({
                where: { id: customerId },
                attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'userType', 'organizationTypeId', 'dateOfIncorporation', 'moduleId', 'panType', 'panImage'],
                include: [
                    {
                        model: models.customerKycPersonalDetail,
                        as: 'customerKycPersonal',
                        required: false,
                        attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
                        include: [{
                            model: models.occupation,
                            as: 'occupation'
                        }, {
                            model: models.identityType,
                            as: 'identityType'
                        }]
                    },
                    {
                        model: models.customerKycOrganizationDetail,
                        as: 'organizationDetail',
                        required: false,
                        attributes: ['id', 'customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate'],
                    },
                    {
                        model: models.customerKycAddressDetail,
                        as: 'customerKycAddress',
                        attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
                        include: [{
                            model: models.state,
                            as: 'state'
                        }, {
                            model: models.city,
                            as: 'city'
                        }, {
                            model: models.addressProofType,
                            as: 'addressProofType'
                        }],
                        order: [["id", "ASC"]]
                    },
                    {
                        model: models.organizationType,
                        as: "organizationType",
                        attributes: ['id', 'organizationType']
                    }]
            })
        }

        let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

        return res.status(200).json({ customerId, customerKycId, customerKycCurrentStage, customerKycReview, moduleId, userType})

}


exports.submitCustomerKycBankDetail = async (req, res, next) => {

}


exports.submitAllKycInfo = async (req, res, next) => {

    let { customerId, customerKycId, customerKycPersonal, customerKycAddress, customerKycBank, customerKycBasicDetails, customerOrganizationDetail, moduleId, userType } = req.body;
    let modifiedBy = req.userData.id;

    // let findCustomerKyc = await models.customerKyc.findOne({ where: { id: customerKycId } })
    // if (check.isEmpty(findCustomerKyc)) {
    //     return res.status(404).json({ message: "This customer kyc detailes is not filled." });
    // }
    if (moduleId == 1) {
        let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { customerId: { [Op.not]: customerId }, identityProofNumber: customerKycPersonal.identityProofNumber } });
        if (!check.isEmpty(findIdentityNumber)) {
            return res.status(400).json({ message: "Identity Proof Number already exists! " })
        }
    }

    if (customerKycBasicDetails.panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: customerId },
                panCardNumber: { [Op.iLike]: customerKycBasicDetails.panCardNumber },
                isActive: true
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            return res.status(400).json({ message: "Pan Card Number already exists! " })
        }
    }
    if (customerKycPersonal) { 
        customerKycPersonal['modifiedBy'] = modifiedBy
    }
    if (customerOrganizationDetail) {
        customerOrganizationDetail['modifiedBy'] = modifiedBy
    }


    let addressArray = []
    for (let i = 0; i < customerKycAddress.length; i++) {

        customerKycAddress[i]['modifiedBy'] = modifiedBy
        addressArray.push(customerKycAddress[i]);

    }

    if(moduleId == 3 && userType == "Individual"){
        if(customerKycAddress[0].addressProofTypeId == 2){
            customerKycPersonal['identityTypeId'] = 5;
            customerKycPersonal['identityProof'] = customerKycAddress[0].addressProof;
            customerKycPersonal['identityProofNumber'] = customerKycAddress[0].addressProofNumber;
        }
    }

    await sequelize.transaction(async (t) => {
        let personalId = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });

        await models.customer.update({ firstName: customerKycBasicDetails.firstName, lastName: customerKycBasicDetails.lastName, panCardNumber: customerKycBasicDetails.panCardNumber, panType: customerKycBasicDetails.panType, panImage: customerKycBasicDetails.panImage, userType: customerKycBasicDetails.userType, organizationTypeId: customerKycBasicDetails.organizationTypeId, dateOfIncorporation: customerKycBasicDetails.dateOfIncorporation }, { where: { id: customerId }, transaction: t })

        if (moduleId == 1) {
            await models.customerKycPersonalDetail.update(customerKycPersonal, { where: { customerId: customerId }, transaction: t });
        }
        if (moduleId == 3) {
            if (userType == "Individual") {
                await models.customerKycPersonalDetail.update(customerKycPersonal, { where: { customerId: customerId }, transaction: t });
            } else {
                await models.customerKycOrganizationDetail.update(customerOrganizationDetail, { where: { customerId: customerId }, transaction: t })
            }
        }

        await models.customerKycAddressDetail.bulkCreate(addressArray, { updateOnDuplicate: ["addressType", "address", "stateId", "cityId", "pinCode", "addressProofTypeId", "addressProof", "addressProofNumber", "modifiedBy"] }, { transaction: t })

        await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "4" }, { where: { customerId }, transaction: t });

    })
    let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    let KycClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId } });
    let kycRating = await models.customerKyc.findOne({ where: { customerId: customerId } })

    let ratingStage = 1;
    if(moduleId == 1 && KycClassification && (KycClassification.kycStatusFromCce == "pending" || !KycClassification.kycStatusFromCce)){
        ratingStage = 1
    }else if(moduleId == 1 && KycClassification && KycClassification.kycStatusFromCce == "approved"){
        ratingStage = 2
    }else if(moduleId == 3 && KycClassification && (KycClassification.scrapKycStatusFromCce == "pending" || !KycClassification.scrapKycStatusFromCce) ){
        ratingStage = 1
    }else if(moduleId == 3 && KycClassification && KycClassification.scrapKycStatusFromCce == "approved"){
        ratingStage = 2
    }

    if(!KycClassification){
        ratingStage = 1
    }

    // if (KycClassification && (KycClassification.kycStatusFromCce == "pending" || KycClassification.scrapKycStatusFromCce == "pending") ) {
    //     ratingStage = 1
    // } else if(KycClassification && (KycClassification.kycStatusFromCce == "approved" || KycClassification.scrapKycStatusFromCce == "approved")) {
    //     ratingStage = 2
    // }
    // if(!KycClassification){
    //     ratingStage = 1
    // }

    // console.log(KycClassification);
    return res.status(200).json({ message: `successful`, customerId, customerKycId, customerKycCurrentStage, KycClassification, ratingStage, moduleId, userType })

}

exports.appliedKyc = async (req, res, next) => {
    try{
 // let { roleName } = await models.role.findOne({ where: { id: req.userData.roleId[0] } })


 const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
);
let query = {};
// if (req.query.kycStatus) {
//     query.kycStatus = sequelize.where(
//         sequelize.cast(sequelize.col("customer.kyc_status"), "varchar"),
//         {
//             [Op.iLike]: req.query.kycStatus + "%",
//         }
//     );
// }
// if (req.query.cceStatus) {
    // query.cceRating = sequelize.where(
    //     sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_cce"), "varchar"),
    //     {
    //         [Op.iLike]: req.query.cceStatus + "%",
    //     }
    // );
// }
if (req.query.cceStatus) {
    query["$customerKycClassification.kyc_status_from_cce$"] = await req.query.cceStatus;
}

// if (req.query.kycStatusFromOperationalTeam) {
//     query.kycStatusFromOperationalTeam = sequelize.where(
//         sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_operational_team"), "varchar"),
//         {
//             [Op.iLike]: search + "%",
//         }
//     )
// }

const searchQuery = {
    [Op.and]: [query, {
        [Op.or]: {
            "$customer.first_name$": { [Op.iLike]: search + "%" },
            "$customer.last_name$": { [Op.iLike]: search + "%" },
            "$customer.mobile_number$": { [Op.iLike]: search + "%" },
            "$customer.pan_card_number$": { [Op.iLike]: search + "%" },
            "$customer.customer_unique_id$": { [Op.iLike]: search + "%" },
            kyc_status: sequelize.where(
                sequelize.cast(sequelize.col("customer.kyc_status"), "varchar"),
                {
                    [Op.iLike]: search + "%",
                }
            ),
            scrap_kyc_status: sequelize.where(
                sequelize.cast(sequelize.col("customer.scrap_kyc_status"), "varchar"),
                {
                    [Op.iLike]: search + "%",
                }
            ),
            // kyc_rating_cce: sequelize.where(
            //     sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_cce"), "varchar"),
            //     {
            //         [Op.iLike]: search + "%",
            //     }
            // ),
            // scrap_kyc_status_from_cce: sequelize.where(
            //     sequelize.cast(sequelize.col("customerKycClassification.scrap_kyc_status_from_cce"), "varchar"),
            //     {
            //         [Op.iLike]: search + "%",
            //     }
            // ),
            // kyc_rating_bm: sequelize.where(
            //     sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_operational_team"), "varchar"),
            //     {
            //         [Op.iLike]: search + "%",
            //     }
            // )
        }
    }],
    isActive: true,
    [Op.or] : { isKycSubmitted: true, isScrapKycSubmitted: true},
    // isKycSubmitted: true,
    // isScrapKycSubmitted: true
}
let internalBranchId = req.userData.internalBranchId
let internalBranchWhere;

let assignAppraiser;

if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
    internalBranchWhere = { isActive: true, internalBranchId: internalBranchId }
    // if (req.userData.userTypeId == 7) {
    //     assignAppraiser = { appraiserId: req.userData.id }
    // }
} else {
    internalBranchWhere = { isActive: true }
}

// if (req.userData.userTypeId == 6) {
//     customerKycClassification = {
//         kycStatusFromCce: { [Op.in]: ["approved", 'pending', 'incomplete', 'rejected'] },
//     }
// } else {
//     customerKycClassification = {
//         kycStatusFromCce: { [Op.in]: ['approved'] },
//     }
// }

const includeArray = [
    {
        model: models.customerKycClassification,
        as: 'customerKycClassification',
        required: false,
        // where: customerKycClassification,
        attributes: ['kycStatusFromCce', 'reasonFromCce', 'kycStatusFromOperationalTeam', 'reasonFromOperationalTeam', 'scrapKycStatusFromCce', 'scrapReasonFromCce', 'scrapKycStatusFromOperationalTeam', 'scrapReasonFromOperationalTeam']
    },
    {
        model: models.customer,
        as: 'customer',
        attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'kycStatus', 'customerUniqueId', 'moduleId', 'userType', 'scrapKycStatus'],
        where: internalBranchWhere,
        include:{
            model: models.appraiserRequest,
            as: 'appraiserRequest',
        }
    }
]

let user = await models.user.findOne({ where: { id: req.userData.id } });

// if (user.userTypeId == 5) {
//     searchQuery.isVerifiedByCce = true
// }

let getAppliedKyc = await models.customerKyc.findAll({
    where: searchQuery,
    subQuery: false,
    attributes: ['id', 'customerId', 'createdAt', 'updatedAt'],
    order: [["updatedAt", "DESC"], [models.customer, models.appraiserRequest ,'id' , 'DESC']],
    offset: offset,
    limit: pageSize,
    include: includeArray
})
let count = await models.customerKyc.findAll({
    where: searchQuery,
    include: includeArray,
});
if (getAppliedKyc.length == 0) {
    return res.status(200).json({ data: [] })
}
return res.status(200).json({ data: getAppliedKyc, count: count.length })

    }catch(err){
        console.log(err);
    }
   

}



exports.getReviewAndSubmit = async (req, res, next) => {

    let { customerId, customerKycId } = req.query;
    let appraiserRequestData = await models.appraiserRequest.findAll({
        where:{
            customerId : customerId
        },
        order: [["updatedAt", "DESC"]]
    })
    let customerKycReview = await models.customer.findOne({
        where: { id: customerId },
        attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage', 'moduleId', 'userType', 'dateOfIncorporation'],
        include: [{
            model: models.customerKycPersonalDetail,
            as: 'customerKycPersonal',
            attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
            include: [{
                model: models.occupation,
                as: 'occupation'
            }, {
                model: models.identityType,
                as: 'identityType'
            }]
        }, {
            model: models.customerKycAddressDetail,
            as: 'customerKycAddress',
            attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
            include: [{
                model: models.state,
                as: 'state'
            }, {
                model: models.city,
                as: 'city'
            }, {
                model: models.addressProofType,
                as: 'addressProofType'
            }],
            order: [["id", "ASC"]]
        }, {
            model: models.customerKycOrganizationDetail,
            as: "organizationDetail",
            attributes: ['customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate']
        },
        {
            model: models.organizationType,
            as: "organizationType",
            attributes: ['id', 'organizationType']
        }
]
    })
    let userType = null;
    let moduleId = appraiserRequestData[0].moduleId;
    if(moduleId == 3){

        userType = customerKycReview.userType;
    }
    

    return res.status(200).json({ customerKycReview, moduleId , userType, customerId, customerKycId })
}


