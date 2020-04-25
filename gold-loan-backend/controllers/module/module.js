const models = require('../../models');

exports.readAllModule = async (req, res, next) => {
    try{
        let readModuleData = await models.module.getAllModule();
        if (!readModuleData) {
            return res.status(404).json({ message: "Data not found" });
        }
        return res.status(200).json( readModuleData );

    } catch(err){
        console.log(err)
    }
}




