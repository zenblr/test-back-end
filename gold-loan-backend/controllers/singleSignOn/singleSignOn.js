const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');
const uuidAPIKey = require('uuid-apikey');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
var multiparty = require('multiparty');
var atob = require('atob');
let uniqid = require('uniqid');
exports.singleSignOnBroker = async (req, res, next) => {
    try {

        var form = new multiparty.Form();
        let productId;
        let isProductGiven;
        let redirectOn;
        const newFields = await new Promise((resolve, reject) => {

            form.parse(req, async function (err, fields, files) {
                if (err) {
                    reject(err);
                } else {
                    resolve(fields);
                }
            })
        });

        let token = newFields.token[0];
        var fields = token.split('.');
        const decoded = JSON.parse(atob(`${fields[1]}`));
        if (!decoded) {
            return res.status(401).send({ message: 'Unauthorized' });
        }
        //check keys
        if (!decoded.merchantUserId) {
            return res.status(400).send({ message: 'merchantUserId key is required' });
        }
        let merchantUserId = decoded.merchantUserId;

        let merchantUserData = await models.user.findOne({ where: { userUniqueId: { [Op.iLike]: merchantUserId } } });
        if (!merchantUserData) {
            return res.status(401).send({ message: 'Invalid merchant user Id' });
        }
        let merchantData = await models.merchant.findOne({ where: { userId: merchantUserData.id } });
        let merchantId = merchantData.id
        const merchantApiKeyData = await models.merchantApikey.findOne({ where: { userId: merchantUserData.id } });
        let apiKey = uuidAPIKey.toAPIKey(merchantApiKeyData.apiKey);
        const decode = await jwt.verify(token, apiKey);
        if (!decode.brokerId) {
            return res.status(400).send({ message: 'brokerId key is required' });
        }
        if(!decode.vleSession) {
            return res.status(400).send({ message: 'vleSession key is required' });
        }
        let vleSession = decode.vleSession;
        let skuCode = decode.skuCode;
        let brokerId = decode.brokerId;
        let mobileNumber = decode.brokerMobileNumber;
        let firstName = decode.firstName;
        let lastName = decode.lastName;
        let email = decode.email;
        let address = decode.address;
        let state = decode.state;
        let city = decode.city;
        let pincode = decode.pincode;
        let storeId = decode.storeId;
        let panCardNumber = decode.panCardNumber;
        //check product
        if(decode.skuCode){
            isProductGiven = true
            let productData = await models.products.findOne({where : {sku : { [Op.iLike]: skuCode } }});
            if(productData){
                productId = productData.id
            }else{
                isProductGiven = false
            }
        }
        if(isProductGiven){
            redirectOn = `/broker/shop/product/${productId}`
        }else{
            redirectOn = `/broker/shop`
        }
        //check state city
        if (merchantData) {
            if (merchantData.status != true) {
                return res.status(401).send({ message: 'Merchant account is deactivated' });
            }
            let userData = await models.user.findOne({ where: { userUniqueId: { [Op.iLike]: brokerId } } });
            if (userData) {
                const broker = await models.broker.findOne({
                    where: {
                        userId: userData.id,
                        merchantId: merchantId
                    }
                });
                if (broker) {
                    if (broker.status != true) {
                        return res.status(401).send({ message: 'your account is deactivated' })
                    }
                    if (broker.approvalStatusId != 2) {
                        return res.status(401).send({ message: 'Broker account is not approved' });
                    }
                    let checkUser = await models.user.findOne({
                        where: {
                            id: broker.userId
                        },
                        include: [{
                            model: models.role
                        }]
                    });

                    let defaultFind = await getTokenRolePermission(checkUser)

                    if (defaultFind.status) {
                        let permissions = defaultFind.permissions.filter(data => data.description == 'customerView' || data.description == 'orderView' || data.description == 'productView')
                        res.cookie(`Token`, `${JSON.stringify(defaultFind.Token)}`);
                        res.cookie('vleSession',`${vleSession}`);
                        res.cookie(`RedirectOn`, `${JSON.stringify(redirectOn)}`);
                        // res.cookie(`modules`, `${JSON.stringify(defaultFind.modules)}`);
                        res.cookie(`permissions`, `${JSON.stringify(permissions)}`);
                        res.cookie(`userDetails`, `${JSON.stringify(defaultFind.userDetails)}`);
                        res.redirect(`${process.env.SINGLE_SIGN_ON}`);
                        // return res.status(200).json({ Token: defaultFind.Token, modules: defaultFind.modules, permissions: defaultFind.permissions, userDetails: defaultFind.userDetails })

                    }
                } else {
                    return res.status(401).send({ message: 'invalid credentials' });
                }
            } else {
                //create broker code
                if (!decode.brokerMobileNumber) {
                    return res.status(400).send({ message: 'brokerMobileNumber key is required' });
                }
                if (!decode.firstName) {
                    return res.status(400).send({ message: 'firstName key is required' });
                }
                if (!decode.lastName) {
                    return res.status(400).send({ message: 'lastName key is required' });
                }
                if (!decode.email) {
                    return res.status(400).send({ message: 'email key is required' });
                }
                if (!decode.address) {
                    return res.status(400).send({ message: 'address key is required' });
                }
                if (!decode.state) {
                    return res.status(400).send({ message: 'state key is required' });
                }
                if (!decode.city) {
                    return res.status(400).send({ message: 'city key is required' });
                }
                if (!decode.pincode) {
                    return res.status(400).send({ message: 'pincode key is required' });
                }
                if (!decode.storeId) {
                    return res.status(400).send({ message: 'storeId key is required' });
                }
                if (decode.panCardNumber) {
                    let checkPanNumber = await panCardNumberrVerification(panCardNumber);
                    if (!checkPanNumber) {
                        return res.status(401).send({ message: 'Invalid PanCard Number' });
                    }
                    //check user pancard
                    let userPanData = await models.user.findOne({ where: { panCardNumber: panCardNumber } })
                    if (userPanData) {
                        return res.status(400).send({ message: 'Pan Card Number already exists' });
                    }
                }

                let checkMobileNo = await phonenumber(mobileNumber);
                if (!checkMobileNo) {
                    return res.status(401).send({ message: 'Invalid Mobile number' });
                }

                let checkMobile = await models.user.findOne({ where: { mobileNumber: mobileNumber } });
                if (checkMobile) {
                    return res.status(400).send({ message: 'Mobile number already exists' });
                }

                //check email
                let userEmailData = await models.user.findOne({ where: { email: { [Op.iLike]: email } } })
                if (userEmailData) {
                    return res.status(400).send({ message: 'EmailId already exists' });
                }
                //check city and state
                let findCityId = await models.city.findOne({
                    where: {
                        name: { [Op.iLike]: city }
                    }
                })
                if (findCityId) {
                    cityId = await findCityId.id;
                } else {
                    return res.status(400).json({ message: "incorrect city name" });
                }
                let findStateId = await models.state.findOne({
                    where: {
                        name: { [Op.iLike]: state }
                    }
                })
                if (findStateId) {
                    stateId = await findStateId.id;
                } else {
                    return res.status(400).json({ message: "incorrect state name" });
                }
                // checkStore
                let userInfo = await sequelize.transaction(async t => {
                    let storeData = await models.store.findOne({ where: { storeUniqueId: storeId, merchantId } });
                    let storeDataId;
                    if (!storeData) {
                        let storeDataCheck = await models.store.findOne({ where: { storeUniqueId: storeId } });
                        if (storeDataCheck) {
                            return res.status(400).json({ message: "Store Id already exists" });
                        }
                        let store = await models.store.create({ storeUniqueId: storeId, merchantId, createdBy: merchantUserData.id, updatedBy: merchantUserData.id }, { transaction: t });
                        storeDataId = store.id;
                    } else {
                        storeDataId = storeData.id;
                    }
                    ////
                    const userTypeId = 3;  //for broker using const
                    let userId;
                    let userUniqueId = brokerId;
                    let createdUser = merchantUserData.id;
                    const password = firstName.slice(0, 3) + '@' + mobileNumber.slice(mobileNumber.length - 5, 9);
                    let userData = await models.user.create({ userUniqueId, firstName, lastName, mobileNumber, email, userTypeId, createdBy: createdUser, modifiedBy: createdUser, panCardNumber, password }, { transaction: t });
                    userId = userData.id;
                    await models.user_address.create({ stateId, cityId, userId, postalCode: pincode, address }, { transaction: t });
                    await models.userRole.create({ userId, roleId: 3 }, { transaction: t });
                    await models.broker.create({ userId, merchantId, storeId: storeDataId, approvalStatusId: 2, createdBy: createdUser, updatedBy: createdUser }, { transaction: t });
                    let checkUser = await models.user.findOne({
                        where: {
                            id: userId
                        },
                        transaction: t,
                        include: [{
                            model: models.role
                        }]
                    });
                    return checkUser
                })
                ///
                let defaultFind = await getTokenRolePermission(userInfo)

                if (defaultFind.status) {
                    let permissions = defaultFind.permissions.filter(data => data.description == 'customerView' || data.description == 'orderView' || data.description == 'productView')
                    res.cookie(`Token`, `${JSON.stringify(defaultFind.Token)}`);
                    res.cookie(`RedirectOn`, `${JSON.stringify(redirectOn)}`);
                    res.cookie('vleSession',`${vleSession}`);
                    // res.cookie(`modules`, `${JSON.stringify(defaultFind.modules)}`);
                    res.cookie(`permissions`, `${JSON.stringify(permissions)}`);
                    res.cookie(`userDetails`, `${JSON.stringify(defaultFind.userDetails)}`);
                    res.redirect(`${process.env.SINGLE_SIGN_ON}`);
                    // return res.status(200).json({ Token: defaultFind.Token, modules: defaultFind.modules, permissions: defaultFind.permissions, userDetails: defaultFind.userDetails })

                }
            }

        } else {
            return res.status(401).send({ message: 'invalid apiKey' });
        }

    } catch (err) {
        errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);
        if (err.name) {
            if (err.message) {
                return res.status(401).send({ message: err.message });
            }
        }
        return res.status(401).send({ message: 'invalid credentials' });
    }

}

exports.getTokenInfo = async (req, res, next) => {
    let userId = req.userData.id;
    let checkUser = await models.user.findOne({
        where: {
            id: userId
        },
        include: [{
            model: models.role
        }]
    });
    let getRole = await models.userRole.getAllRole(checkUser.dataValues.id);
    let roleId = await getRole.map((data) => data.roleId);
    let modules = await models.roleModule.findAll({
        where: { roleId: { [Op.in]: roleId }, isActive: true },
        attributes: [],
        include: [
            {
                model: models.module,
                as: 'module',
                attributes: ['id', 'moduleName'],
                where: { isActive: true }
            },
        ]
    });

    let getPermissions = await models.rolePermission.findAll({ where: { roleId: { [Op.in]: roleId }, isActive: true }, attributes: ['permissionId'] });
    let permissionId = await getPermissions.map((data) => data.permissionId);
    let permissions = await models.permission.findAll({
        attributes: ['id', 'actionName', 'description'],
        raw: true,
        where: { isActive: true, id: { [Op.in]: permissionId } }
    })
    let userDetails = {};
    userDetails = {
        userTypeId: checkUser.userTypeId
    }
    return res.status(200).json({ modules, permissions, userDetails })
}

function panCardNumberrVerification(panNo) {
    var panNumber = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
    if ((panNo.match(panNumber))) {
        return true;
    }
    else {
        return false;
    }
}

function phonenumber(mobNo) {
    var phoneno = /^\d{10}$/;
    if ((mobNo.match(phoneno))) {
        return true;
    }
    else {
        return false;
    }
}


async function getTokenRolePermission(checkUser) {

    let userRoleId = await checkUser.roles.map((data) => data.id);
    let roleName = await checkUser.roles.map((data) => data.roleName)
    let Token = jwt.sign({
        id: checkUser.dataValues.id,
        mobile: checkUser.dataValues.mobileNumber,
        firstName: checkUser.dataValues.firstName,
        lastName: checkUser.dataValues.lastName,
        roleId: userRoleId,
        roleName: roleName,
        userTypeId: checkUser.userTypeId,
        internalBranchId: null,
        ssoRedirect : true,
    },
        JWT_SECRETKEY, {
        expiresIn: JWT_EXPIRATIONTIME
    });
    const decoded = jwt.verify(Token, JWT_SECRETKEY);
    const createdTime = new Date(decoded.iat * 1000).toGMTString();
    const expiryTime = new Date(decoded.exp * 1000).toGMTString();
    await models.user.update({ lastLogin: createdTime }, {
        where: { id: decoded.id }
    });
    models.logger.create({
        userId: decoded.id,
        token: Token,
        expiryDate: expiryTime,
        createdDate: createdTime
    });

    let getRole = await models.userRole.getAllRole(checkUser.dataValues.id);
    let roleId = await getRole.map((data) => data.roleId);
    let modules = await models.roleModule.findAll({
        where: { roleId: { [Op.in]: roleId }, isActive: true },
        attributes: [],
        include: [
            {
                model: models.module,
                as: 'module',
                attributes: ['id', 'moduleName'],
                where: { isActive: true }
            },
        ]
    });

    let getPermissions = await models.rolePermission.findAll({ where: { roleId: { [Op.in]: roleId }, isActive: true }, attributes: ['permissionId'] });
    let permissionId = await getPermissions.map((data) => data.permissionId);
    let permissions = await models.permission.findAll({
        attributes: ['id', 'actionName', 'description'],
        raw: true,
        where: { isActive: true, id: { [Op.in]: permissionId } }
    })
    let userDetails = {};
    userDetails = {
        userTypeId: checkUser.userTypeId
    }

    let data = {
        Token, modules, permissions, userDetails, status: true
    }

    return data
}