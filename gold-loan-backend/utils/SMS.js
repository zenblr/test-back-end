const sms = require('./sendSMS');
const models = require('../models');
const smsLink = `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx`;


exports.sendOtpForLogin = async (mobileNumber, firstName, otp, time) => {
    let messageTemplate = await models.smsAlert.getSmsTemplate('Login with OTP');
    if (messageTemplate) {
        let message = await messageTemplate.content.replace('<User name>', `${firstName}`).replace("<OTP number>", otp).replace("<Time>", time).replace("<Web site>", smsLink)
       
        await sms.sendSms(mobileNumber, message);
    }
}
// "Dear <User name>, Please use OTP <OTP number> valid upto <Time> to log in to your Augmont gold loan account.  Please visit <Web site> to log in"