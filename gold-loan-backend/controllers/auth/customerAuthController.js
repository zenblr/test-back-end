const models = require('../../models');
const jwt = require('jsonwebtoken');

const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
let check = require('../../lib/checkLib');

exports.customerLogin = async(req, res) => {
    try {
        const { firstName, password } = req.body;
        let checkCustomer = await models.customers.findOne({ where: { firstName: firstName } });
        if (!checkCustomer) {
            return res.status(404).json({ message: 'Wrong Credentials' })
        }
        let customerDetails = await checkCustomer.comparePassword(password);
        console.log(customerDetails)
        if (customerDetails === true) {
            const Token = jwt.sign({
                    id: checkCustomer.dataValues.id,
                    mobile: checkCustomer.dataValues.mobileNumber,
                    firstName: checkCustomer.dataValues.firstName,
                    lastName: checkCustomer.dataValues.lastName,
                },
                JWT_SECRETKEY, {
                    expiresIn: JWT_EXPIRATIONTIME
                });

            return res.status(200).json({ message: 'login successful', Token });
        } else {
            res.status(401).json({ message: 'Wrong Credentials' });
        }
    } catch (error) {
        return res.status(400).json({ message: `Server Error` })
    }
}