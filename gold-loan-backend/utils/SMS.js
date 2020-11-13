const sms = require('./sendSMS');
const models = require('../models');
// const smsLink = `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx`;
// const smsLink = `Gold loan admin panel`


exports.sendOtpForLogin = async (mobileNumber, firstName, otp, time, smsLink) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Login with OTP');
    // Dear <User name>, Please use OTP <OTP number> valid upto <Time> to log in to your Augmont gold loan account.  Please visit <Web site> to log in
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<User name>', `${firstName}`).replace("<OTP number>", otp).replace("<Time>", time).replace("<Web site>", smsLink)

        await sms.sendSms(mobileNumber, message);
    }
}

exports.forgetPasswordOtp = async (mobileNumber, firstName, otp, time, smsLink) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Forgot password');
    // Dear <User name>, Your request has been received. OTP is <OTP number> valid upto <Time>.  Please visit <Web site> to reset your password
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<User name>', `${firstName}`).replace("<OTP number>", otp).replace("<Time>", time).replace("<Web site>", smsLink)

        await sms.sendSms(mobileNumber, message);
    }
}


exports.sendOtpToLeadVerification = async (mobileNumber, firstName, otp, time) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Send OTP (LOAN)');
    // Dear <Lead name>, We look forward to have you as a customer. OTP is <OTP number>, valid up to <Time>, for mobile verification purposes.  Please merely confirm that you have received the OTP
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<Lead name>', `${firstName}`).replace("<OTP number>", otp).replace("<Time>", time)
        await sms.sendSms(mobileNumber, message);
    }
}


exports.sendCustomerUniqueId = async (mobileNumber, firstName, customerUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Customer ID Generated (LOAN)');
    // Dear <Customer Name>, Thank you for your business !  Welcome to Augmont --<Brand message>.  Your customer id is <Customer Id>.  Please visit <Web site> to view and / or update your information
    let smsLink = process.env.BASE_URL_CUSTOMER
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<Customer Name>', `${firstName}`).replace("<Customer Id>", customerUniqueId).replace("<Web site>", smsLink).replace("<Brand message>", "(Gold Loan)")
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageToOperationsTeam = async (mobileNumber, customerUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Operation Team (LOAN)');
    // Dear Operations Team, A new customer <Customer Id> has been created. Please visit <Web site> and assign an appraiser to the customer for the loan process
    let smsLink = process.env.BASE_URL_ADMIN
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Id>", customerUniqueId).replace("<Web site>", smsLink)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageAssignedCustomerToAppraiser = async (mobileNumber, appraisalName, customerUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Assign Customer (LOAN)');
    // Dear <Appraiser>, You have been assigned the customer <Customer Id> for appraisal.  Please visit <Web site> for the customer information
    let smsLink = process.env.BASE_URL_ADMIN
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Appraiser>", appraisalName).replace("<Customer Id>", customerUniqueId).replace("<Web site>", smsLink)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageCustomerForAssignAppraiser = async (mobileNumber, appraisalName, appraisalId, customerName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Assign Appraiser (LOAN)');
    // Dear <Customer Name>, The appraiser <Appraiser name> with appraiser id <Appraiser Id number> has been assigned to you to meet your loan process needs
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Appraiser name>", appraisalName).replace("<Appraiser Id number>", appraisalId).replace("<Customer Name>", customerName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageLoanIdGeneration = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Loan ID Generated (LOAN)');
    // Dear <Customer Name>, Thank you for your business !  Your loan request is successfully processed and your loan id is <Loan Id>.  Please visit <Web site> to view your loan information
    let smsLink = process.env.BASE_URL_CUSTOMER
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<Loan Id>", loanUniqueId).replace("<Web site>", smsLink)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendDisbursalMessage = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Disbursal (LOAN)');
    // Dear <Customer Name>, Your request for gold loan (<loan id>) has been approved and amount has been transfered to your bank account
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendPaymentMessage = async (mobileNumber, customerName, loanUniqueId, amount) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Payment (LOAN)');
    //Dear <Customer Name>, Your Pament of <Amount> for Gold loan (<loan id>) has been approved
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId).replace("<Amount>", amount)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendPartReleaseRequestMessage = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Part Release Request (LOAN)');
    //Dear <Customer Name>, We have received your part of the jewellery release request against gold loan (<loan id>), We will check and update you in 24 hrs
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendPartReleaseRequestApprovalMessage = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Part Release Request Approval(By Ops) (LOAN)');
    //Dear <Customer Name>, Your part of the jewellery release request against gold loan (<loan id>) has been approved
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendPartReleaseAssignAppraiserMessage = async (mobileNumber, customerName, loanUniqueId, appraiserName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Part Release Assign Appraiser (LOAN)');
    //Dear <Customer Name>, Your part of the jewellery release request has been assign to <Appraiser Name> against gold loan (<loan id>), <Appraiser Name> will contact you in case of any query
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId).replace("<Appraiser Name>", appraiserName).replace("<Appraiser Name>", appraiserName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendJewelleryPartReleaseCompletedMessage = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Jewellery Part Release Completed (LOAN)');
    //Dear <Customer Name>, Your part of the jewellery release request has been completed against gold loan (<loan id>)
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendFullReleaseRequestMessage = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Full Release Request (LOAN)');
    //Dear <Customer Name>, We have received your Full  release request against gold loan (<loan id>), We will check and update you in 24 hrs
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendFullReleaseRequestApprovalMessage = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Full Release Request Approval(By ops) (LOAN)');
    //Dear <Customer Name>, Your Jewellery release request against gold loan (<loan id>) has been approved
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendFullReleaseAssignAppraiserMessage = async (mobileNumber, customerName, loanUniqueId, appraiserName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Full Release Assign Appraiser (LOAN)');
    //Dear <Customer Name>, Your Jewellery release request has been assign to <Appraiser Name>, <Appraiser Name> will contact you in case of any query
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan Id>", loanUniqueId).replace("<Appraiser Name>", appraiserName).replace("<Appraiser Name>", appraiserName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendJewelleryFullReleaseCompletedMessage = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Jewellery Full Release Completed (LOAN)');
    //Dear <Customer Name>, Your jewellery release request has been completed against gold loan (<loan id>)
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<loan id>", loanUniqueId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendTransferLoanRequestMessage = async (mobileNumber, customerName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Transfer Loan Request (LOAN)');
    //Dear <Customer Name>, We have received the loan transfer request, we will check and update you in 48 hrs
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendKYCApprovalMessage = async (mobileNumber, customerName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('KYC Approval (LOAN)');
    //Dear <Customer Name>, Your KYC Request for the gold loan (loan id) has been approved / rejected
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendKYCApprovalStatusMessage = async (mobileNumber, customerName, ProductName, status) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('KYC Approval Message (LOAN)');
    //Dear <Customer Name>, Your KYC Request for the <Product Name> has been <status>
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<Product Name>", ProductName).replace("<status>", status)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendUpdateLocationCollectMessage = async (mobileNumber, otp, receiverName, DeliveryPersonName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Update Location OTP (Loan)');
    //Dear <Receiver Name>, Please collect the packet and share the OTP <OTP> with <Delivery Person Name>
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<OTP>", otp).replace("<Receiver Name>", receiverName).replace("<Delivery Person Name>", DeliveryPersonName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendUpdateLocationHandoverMessage = async (mobileNumber, otp, receiverName, DeliveryPersonName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Update Location OTP (Partner Branch User) (Loan)');
    //Dear <Receiver Name>, Please handover the packet and share the OTP <OTP> with <Delivery Person Name>
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<OTP>", otp).replace("<Receiver Name>", receiverName).replace("<Delivery Person Name>", DeliveryPersonName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForBuy = async (customerName,mobileNumber,quantity, metalType, amount) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('buy');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<quantity>", quantity).replace("<metalType>", metalType).replace("<amount>", amount).replace("<name>",customerName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForSell = async (mobileNumber,quantity, metalType, amount) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('sell');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<quantity>", quantity).replace("<metalType>", metalType).replace("<amount>", amount)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForOrderPlaced = async (mobileNumber, orderId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Order Placed');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<orderId>", orderId)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForKycUpdate = async (mobileNumber) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Bank and Kyc update');
    if (messageTemplate) {
        let message = await messageTemplate.content;
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForKycApproved = async (mobileNumber,accountId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Kyc Approved');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<accountId>", accountId);
        await sms.sendSms(mobileNumber, message);
    }
}
exports.sendMessageForKycReject = async (mobileNumber, accountId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Kyc Rejected');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<accountId>", accountId);
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForWithdrawAccept = async (mobileNumber, amount) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Withdraw Accepted');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<amount>", amount);
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForWithdrawReject = async (mobileNumber) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Withdraw Rejected');
    if (messageTemplate) {
        let message = await messageTemplate.content;
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageForWithdrawCompleted = async (mobileNumber, amount) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Withdraw Completed');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<amount>", amount)
        await sms.sendSms(mobileNumber, message);
    }
}