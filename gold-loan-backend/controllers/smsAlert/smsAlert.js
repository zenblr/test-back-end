const models=require('../../models');

//add sms alert

exports.addSmsAlert=async (req,res,next)=>{
    const {event,content}=req.body;
    
    let addSmsAlert=await models.smsAlert.create({event,content});
    if(!addSmsAlert){return res.status(422).json({message:'sms alert not created'});}
    return res.status(201).json({message:'sms alert created'});
}

// get sms alert 
 
exports.readSmsAlert=async(req,res,next)=>{
    const readSmsAlert=await models.smsAlert.findAll({where:{isActive:true}});
    if(!readSmsAlert[0]){
        return res.status(404).json({message:'data not found'})
    } 
    return res.status(200).json(readSmsAlert);
}
//get sms alert by id

exports.readSmsAlertById=async(req,res)=>{
    const smsAlertId=req.params.id;
    const readSmsAlertById=await models.smsAlert.findOne({where:{id:smsAlertId,isActive:true}});
    if(!readSmsAlertById){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json(readSmsAlertById);
}

// update sms alert

exports.updateSmsAlert=async(req,res,next)=>{
    const smsAlertId=req.params.id;
    const{event,content}=req.body;
    let updateSmsAlertData=await models.smsAlert.update({event,content},{where:{id:smsAlertId,isActive:true}});
    if(!updateSmsAlertData[0]){
        return res.status(404).json({message:'sms alert updated failed'});
    }
    return res.status(200).json({message:'updated'});
}

// deactive sms alert

exports.deactiveSmsAlert=async (req,res,next)=>{
    const {id,isActive}=req.query;
    let deactiveSmsAlert=await models.smsAlert.update({isActive:isActive},{where:{id}});
    if(deactiveSmsAlert[0]=== 0){return res.status(404).json({message:'sms Alert delete failed'})}
    return res.status(200).json({message:'Updated'});
}

