const nodemailer = require("nodemailer");
const ejs = require("ejs");
const models = require('../../models');

exports.partnerUsEmail = async (req, res) => {
    const { firstName,lastName,email, mobileNumber, companyName, message } = req.body;
    var name = firstName + " " + lastName
    let partnerWithUS = await models.partnerwithUs.create({ firstName, lastName, email, mobileNumber, companyName, message });

    const transporter = nodemailer.createTransport({
        host: 'email-smtp.us-east-1.amazonaws.com',
        port: 2587,
        auth: {
            user: 'AKIAJFLJOMIQFI3QVLMA',
            pass: 'AiOsGtMxz12P7DAkl1gUO9X6Vax7ZNVl56f9cFFldKWw'
        },
    });

    ejs.renderFile(__dirname + "/emailTemplate.ejs", { name,email, mobileNumber, companyName, message}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            const options = {
                from: `info@augmont.in`,
                to: `support@augmont.com,${email}`,
                // bcc: 'ritesh.bhagat@augmont.in',
                // subject: `[Gold Loan] ${subject}`,
                subject: `Partner Inquiry`,
                html: data,
            };
            transporter.sendMail(options, function (err, info) {
                if (err) {
                    return res.json(err)
                } else {
                    return res.status(200).json({ message: 'Your message has been sent successfully' })
                }
            });
        }
    });
}