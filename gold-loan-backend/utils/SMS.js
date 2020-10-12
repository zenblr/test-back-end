const sms = require('./sendSMS');
const models = require('../models');
// const smsLink = `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx`;
const smsLink = `Gold loan admin panel`


exports.sendOtpForLogin = async (mobileNumber, firstName, otp, time) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Login with OTP');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<User name>', `${firstName}`).replace("<OTP number>", otp).replace("<Time>", time).replace("<Web site>", smsLink)

        await sms.sendSms(mobileNumber, message);
    }
}

exports.forgetPasswordOtp = async (mobileNumber, firstName, otp, time) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Forgot password');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<User name>', `${firstName}`).replace("<OTP number>", otp).replace("<Time>", time).replace("<Web site>", smsLink)

        await sms.sendSms(mobileNumber, message);
    }
}


exports.sendOtpToLeadVerification = async (mobileNumber, firstName, otp, time) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Send OTP (LOAN)');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<Lead name>', `${firstName}`).replace("<OTP number>", otp).replace("<Time>", time)
        await sms.sendSms(mobileNumber, message);
    }
}


exports.sendCustomerUniqueId = async (mobileNumber, firstName, customerUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Customer ID Generated (LOAN)');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<Customer Name>', `${firstName}`).replace("<Customer Id>", customerUniqueId).replace("<Web site>", smsLink)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageToOperationsTeam = async (mobileNumber, customerUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Operation Team (LOAN)');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Id>", customerUniqueId).replace("<Web site>", smsLink)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageAssignedCustomerToAppraiser = async (mobileNumber, appraisalName, customerUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Assign Customer (LOAN)');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Appraiser>", appraisalName).replace("<Customer Id>", customerUniqueId).replace("<Web site>", smsLink)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageCustomerForAssignAppraiser = async (mobileNumber, appraisalName, appraisalId, customerName) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Assign Appraiser (LOAN)');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Appraiser name>", appraisalName).replace("<Appraiser Id number>", appraisalId).replace("<Customer Name>", customerName)
        await sms.sendSms(mobileNumber, message);
    }
}

exports.sendMessageLoanIdGeneration = async (mobileNumber, customerName, loanUniqueId) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Loan ID Generated (LOAN)');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace("<Customer Name>", customerName).replace("<Loan Id>", loanUniqueId).replace("<Web site>", smsLink)
        await sms.sendSms(mobileNumber, message);
    }
}


