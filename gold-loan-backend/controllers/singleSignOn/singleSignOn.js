const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');
const uuidAPIKey = require('uuid-apikey');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
var multiparty = require('multiparty');
var atob = require('atob');
exports.singleSignOnBroker = async (req, res, next) => {
    try {

        var form = new multiparty.Form();

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
        console.log(decoded)
        if (!decoded) {
            return res.status(401).send({ message: 'Unauthorized' });
        }

        let merchantUserId = decoded.merchantUserId;

        let userData = await models.user.findOne({ where: {userUniqueId: {[Op.iLike]: merchantUserId} } });
        if (!userData) {
            return res.status(401).send({ message: 'Invalid merchant user Id' });
        }
        let merchantData = await models.merchant.findOne({ where: { userId: userData.id } });
        const merchantApiKeyData = await models.merchantApikey.findOne({ where: { userId: userData.id } });
        let apiKey = uuidAPIKey.toAPIKey(merchantApiKeyData.apiKey);
        const decode = await jwt.verify(token, apiKey);
        let mobileNumber = decode.mobileNumber;
        let firstName = decode.firstName;
        let lastName = decode.lastName;
        let email = decode.email;
        let address = decode.address;
        let state = decode.state;
        let city = decode.city;
        let pincode = decode.pincode;
        let storeId = decode.storeId;
        console.log({firstName,lastName,email,address,state,city,pincode,storeId})
        //check state city
        if (merchantData) {
            /// api key

            ///
            console.log(merchantData)
            if (merchantData.status != true) {
                return res.status(401).send({ message: 'Merchant account is deactivated' });
            }
            let userData = await models.user.findOne({ where: { mobileNumber: mobileNumber } })
            const broker = await models.broker.findOne({
                where: {
                    userId: userData.id,
                    merchantId: merchantData.id
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

                    res.cookie(`Token`, `${JSON.stringify(defaultFind.Token)}`);
                    res.cookie(`modules`, `${JSON.stringify(defaultFind.modules)}`);
                    res.cookie(`permissions`, `${JSON.stringify(defaultFind.permissions)}`);
                    res.cookie(`userDetails`, `${JSON.stringify(defaultFind.userDetails)}`);
                    res.redirect(`${process.env.SINGLE_SIGN_ON}`);
                    // return res.status(200).json({ Token: defaultFind.Token, modules: defaultFind.modules, permissions: defaultFind.permissions, userDetails: defaultFind.userDetails })

                }

            } else {
                //broker does not exist create new broker
            }

        } else {
            return res.status(401).send({ message: 'invalid apiKey' });
        }

    } catch (err) {
        console.log(err)
        return res.status(401).send({ message: 'invalid credentials' });
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
        internalBranchId: null
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