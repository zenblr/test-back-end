const models=require('../../models');

exports.addRoughLoanAmount=async(req,res,next)=>{
    const{goldGrossWeight,goldNetWeight,currentLtv}=req.body;
    let totalLoanAmount=goldNetWeight*currentLtv;
    console.log(totalLoanAmount);
    res.status(200).json({TotalAmount:totalLoanAmount});
    
}