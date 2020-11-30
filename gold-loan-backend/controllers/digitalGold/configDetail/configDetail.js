const qs = require('qs');
const models = require('../../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../../lib/checkLib');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../../utils/constant');
const errorLogger = require('../../../utils/errorLogger');

exports.createConfigDetail = async (req, res) => {
  let createdBy = req.userData.id;
  let modifiedBy = req.userData.id;
let { configSettingName, configSettingValue} = req.body;

let ConfigIdofparam = await models.digiGoldConfigDetails.findOne({ where: { configSettingName: configSettingName, configSettingValue:configSettingValue} });

if(check.isEmpty(ConfigIdofparam)){
  await sequelize.transaction(async (t) => {
    await models.digiGoldConfigDetails.create({ configSettingName:configSettingName, configSettingValue:configSettingValue ,createdBy,modifiedBy}, { transaction: t })
    })
    return res.status(200).json({ messgae: `Record Added` });
}else{
  let name=ConfigIdofparam.configSettingName;
  let value=ConfigIdofparam.configSettingValue;
  let IdofConfig=ConfigIdofparam.id

  await sequelize.transaction(async (t) => {
    await models.digiGoldConfigDetailsHistory.create({ configSettingId:ConfigIdofparam.id,configSettingName:ConfigIdofparam.configSettingName, configSettingValue:ConfigIdofparam.configSettingValue ,createdBy,modifiedBy}, { transaction: t })
    })
  await sequelize.transaction(async (t) => {
    const Config = await models.digiGoldConfigDetails.update(
     
      { name, value,IdofConfig,createdBy,modifiedBy},
      { where: { id: ConfigIdofparam.id }, transaction: t }
    );
  });
  return res.status(200).json({ messgae: `Record Updated` });
}


}

// exports.getConfigDetail = async (req, res) => {
  
// }
exports.editConfigDetail = async (req, res) => {
   
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    const { configId } = req.params;
 
  
  
    let { configSettingName, configSettingValue } = req.body;
   
    let ConfigIdofparam = await models.digiGoldConfigDetails.findOne({ where: { id: configId } });
   
    if (check.isEmpty(ConfigIdofparam)) {
      return res.status(404).json({ message: "Record does not exist" });
    }
   
    await sequelize.transaction(async (t) => {
      await models.digiGoldConfigDetailsHistory.create({ configSettingId:ConfigIdofparam.id,configSettingName:ConfigIdofparam.configSettingName, configSettingValue:ConfigIdofparam.configSettingValue ,createdBy}, { transaction: t })
      })
    await sequelize.transaction(async (t) => {
      const Config = await models.digiGoldConfigDetails.update(
        { configSettingName, configSettingValue, modifiedBy},
        { where: { id: configId }, transaction: t }
      );
    });
    return res.status(200).json({ messgae: `Record Updated` });
}

exports.deleteConfigDetail = async (req, res) => {
  let modifiedBy = req.userData.id;
  const { configId } = req.params;

  let ConfigIdofparam = await models.digiGoldConfigDetails.findOne({ where: { id: configId } });
   
  if (check.isEmpty(ConfigIdofparam)) {
    return res.status(404).json({ message: "Record does not exist" });
  }
  await sequelize.transaction(async (t) => {
    const Config = await models.digiGoldConfigDetails.destroy(
     
      { where: { id: configId }, transaction: t }
    );
  });
  return res.status(200).json({ messgae: `Record Deleted` });
  // await models.customerLoanOrnamentsDetail.destroy({ where: { id: { [Op.in]: deleteOrnaments } }, transaction: t });
}

exports.getConfigDetail = async (req, res) => {
  // await sequelize.transaction(async (t) => {
    const Config = await models.digiGoldConfigDetails.findAll(
     
      { where: { isActive: true }}
    );
 
  return res.status(200).json(Config);
}
