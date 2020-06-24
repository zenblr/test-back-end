const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');
const uuidAPIKey = require('uuid-apikey');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
exports.singleSignOnBroker = async (req, res, next) => {
    try{
        const apiKey = req.headers.apikey;
        const userId = req.headers.userid;
        const uuid = uuidAPIKey.toUUID(apiKey);
        const merchant = await models.merchantApikey.findOne({ where: { apiKey: uuid } });
        if(merchant){
            if(merchant.apiKeyStatus){
                const merchnatData = await models.merchant.findOne({where:{
                    userId:merchant.userId
                }});
                if(merchnatData.status==true){
                const user = await models.user.findOne({where:{userUniqueId:userId,isActive:true}});
                if(user){
                const broker = await models.broker.findOne({where:{
                    userId:user.id,
                    merchantId:merchnatData.id
                }});
                if(broker.status == true){
                    if(broker.approvalStatusId == 2){

                        let checkUser = await models.user.findOne({
                            where: {
                                id:broker.userId
                            },
                            include: [{
                                model: models.role
                            }]
                        });
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
                            },)
                            let userDetails = {};
                                userDetails= {
                                    userTypeId: checkUser.userTypeId
                                }
                           
                                // res.writeHead(301, {Location: 'https://gold.nimapinfotech.com/broker/dashboard',
                                // Authorization: `jwt ${Token}`});
                                // return res.end();
                                
                                // res.setHeader('Access-Control-Allow-Origin', 'https://gold.nimapinfotech.com');
                                res.cookie(`Token`,`jwt ${Token}`);
                                res.cookie(`modules`,`${modules}`);
                                res.cookie(`permissions`,`${permissions}`);
                                res.cookie(`userDetails`,`${userDetails}`);
                                // res.append('Set-Cookie', 'Token=' + Token + ';');
                                res.redirect('https://gold.nimapinfotech.com');
                    }else{
                        return res.status(401).send({ message: 'Broker account is not approved' });
                    }
                }else{
                    return res.status(401).send({ message: 'your account is deactivated' });
                }
                }else{
                    return res.status(401).send({ message: 'invalid userId' });
                }
                }else{
                    return res.status(401).send({ message: 'your account is deactivated' });
                }
            }else{
                return res.status(401).send({ message: 'API key is not activated' });
            }
        }else{
            return res.status(401).send({ message: 'invalid apiKey' });
        }
    }catch(err){
        console.log(err)
        return  res.status(401).send({ message: 'invalid credentials' });
    }
   
}