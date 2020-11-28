const models = require("../../models");
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const cron = require('node-cron');
const moment = require('moment');
const nodemailer = require("nodemailer");
const ejs = require("ejs");

exports.readErrorLogs = async (req, res) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let getAllErrors = await models.errorLogger.findAll({
        order: [
            ['id', 'desc']
        ],
        offset: offset,
        limit: pageSize,
    });

    let count = await models.errorLogger.findAll({});
    return res.status(200).json({ message: `Fetched all error logs successfully`, data: getAllErrors, count: count.length })
}

exports.getErrorForMail = async (req, res) => {
    let endTime = moment();
    let startTime = moment(endTime).subtract(30, 'minute');
    console.log("cron working")
    let getAllErrors = await models.errorLogger.findAll({
        order: [
            ['id', 'desc']
        ],
        where : {
            createdAt : {[Op.between]: [startTime, endTime]}
        }
    });
    // return res.status(200).json({ getAllErrors })
    if(getAllErrors.length > 0){
        let newData = [];
        for (const data of getAllErrors) {
            data.body = JSON.stringify(data.body);
            data.userData = JSON.stringify(data.userData);
            newData.push(data)
        }
        const transporter = nodemailer.createTransport({
            host: 'email-smtp.us-east-1.amazonaws.com',
            port: 2587,
            auth: {
                user: 'AKIAJFLJOMIQFI3QVLMA',
                pass: 'AiOsGtMxz12P7DAkl1gUO9X6Vax7ZNVl56f9cFFldKWw'
            },
        });
    
        ejs.renderFile(__dirname + "/errorEmailTemplate.ejs", { newData }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                const options = {
                    from: `info@augmont.in`,
                    to: `pranali@nimapinfotech.com,rupesh@nimapinfotech.com,ravikumar@nimapinfotech.com,bhupen@nimapinfotech.com`,
                    subject: `[Gold Loan] Error logs`,
                    html: data,
                };
                transporter.sendMail(options, function (err, info) {
                    if (err) {
                        return res.json(err)
                    } else {
                        console.log({ message: 'Your message has been sent successfully' });
                        // return res.status(200).json({ message: 'Your message has been sent successfully' })
                    }
                });
            }
        });

    }
}


