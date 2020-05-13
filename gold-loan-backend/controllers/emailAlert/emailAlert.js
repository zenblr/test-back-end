const models=require('../../models');

exports.addEmailAlert=async (req,res,next)=>{
    const {event,variable,subjectLine,content}=req.body;
    
    let addEmailAlert=await models.emailAlert.create({event,variable,subjectLine,content});
    if(!addEmailAlert){return res.status(422).json({message:'email alert not created'});}
    return res.status(201).json({message:'email alert created'});
}

// get email alert 
 
exports.readEmailAlert=async(req,res,next)=>{
    const readEmailAlert=await models.emailAlert.findAll({where:{isActive:true}});
    if(!readEmailAlert[0]){
        return res.status(404).json({message:'data not found'})
    } 
    return res.status(200).json(readEmailAlert);
}
//get email alert by id

exports.readEmailAlertById=async(req,res)=>{
    const emailAlertId=req.params.id;
    const readEmailAlertById=await models.emailAlert.findOne({where:{id:emailAlertId,isActive:true}});
    if(!readEmailAlertById){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json(readEmailAlertById);
}

// update email alert

exports.updateEmailAlert=async(req,res,next)=>{
    const emailAlertId=req.params.id;
    const{event,variable,subjectLine,content}=req.body;
    let updateEmailAlertData=await models.emailAlert.update({event,variable,subjectLine,content},{where:{id:emailAlertId,isActive:true}});
    if(!updateEmailAlertData[0]){
        return res.status(404).json({message:'email alert updated failed'});
    }
    return res.status(200).json({message:'updated'});
}

// deactive email alert

exports.deactiveEmailAlert=async (req,res,next)=>{
    const {id,isActive}=req.query;
    let deactiveEmailAlert=await models.emailAlert.update({isActive:isActive},{where:{id}});
    if(deactiveEmailAlert[0]=== 0){return res.status(404).json({message:'email Alert delete failed'})}
    return res.status(200).json({message:'Updated'});
}

