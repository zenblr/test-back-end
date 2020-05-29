const models=require('../../models');
const check = require("../../lib/checkLib");


// adding holiday list
exports.addHolidayMaster= async(req,res)=>{
    const{holidayDate,description,year}=req.body;
    let modifiedBy=req.userData.id;
    let createdBy=req.userData.id;
    // let modifiedTime=Date.now();
    let holidayDateExist=await models.holidayMaster.findOne({where:{holidayDate:holidayDate,isActive:true}});
    if(!check.isEmpty(holidayDateExist)){
        return res.status(404).json({ message: "This holiday date is already Exists" });
    }
    let addHolidayMasterData=await models.holidayMaster.create({holidayDate,description,year,modifiedBy,createdBy});
    if(!addHolidayMasterData)
    {
        return res.status(422).json({message:'holidayMaster not created'});
    }
    return res.status(201).json({message:'holiday Master is created'});
}

// update holiday list
exports.updateHolidayMaster= async(req,res)=>{
    const id=req.params.id;
    let modifiedBy=req.userData.id;
    const{holidayDate,description,year}=req.body;

    let updateHolidayMaster=await models.holidayMaster.update({holidayDate,description,year,modifiedBy},{where:{id:id,isActive:true}});
    if(!updateHolidayMaster[0]){
        return res.status(404).json({message:'updated failed'});
    }
    return res.status(200).json({message:'Updated'});
}

//raed Holiday List
exports.readHolidayMaster= async (req,res)=>{

    let readHolidayMaster= await models.holidayMaster.findAll({where:{isActive:true},
        order: [["holidayDate", "ASC"]],
        include: [
            {
                model: models.user,
                as: "Createdby",

            },
            {
                model: models.user,
                as: "Modifiedby",

            },]
    });
return res.status(200).json({readHolidayMaster});
}
// deactive Holiday list
exports.deactiveHolidayMaster=async (req,res)=>{
    const{id,isActive}=req.query;
    let deactiveHolidayMaster=await models.holidayMaster.update({isActive:isActive},{where:{id:id}});
    if(!deactiveHolidayMaster[0]){
        return res.status(404).json({message:'updated deleted failed'});
    }
    return res.status(200).json({message:`Updated`})
}
