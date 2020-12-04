const nodemailer = require("nodemailer");
const ejs = require("ejs");

exports.contactUsEmail = async (req, res) => {
    const { name, city, mobileNumber, email, subject, message } = req.body;
    const transporter = nodemailer.createTransport({
        host: 'email-smtp.us-east-1.amazonaws.com',
        port: 2587,
        auth: {
            user: 'AKIAJFLJOMIQFI3QVLMA',
            pass: 'AiOsGtMxz12P7DAkl1gUO9X6Vax7ZNVl56f9cFFldKWw'
        },
    });

    ejs.renderFile(__dirname + "/emailTemplate.ejs", { name, city, mobileNumber, message, email }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            const options = {
                from: `info@augmont.in`,
                to: `help@augmont.in,${email}`,
                bcc: 'ritesh.bhagat@augmont.in',
                subject: `[Gold Loan] ${subject}`,
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