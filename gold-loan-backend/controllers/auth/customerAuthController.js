const models = require('../../models');
const jwt = require('jsonwebtoken');

const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
let check = require('../../lib/checkLib');

exports.customerLogin = async (req, res, next) => {
    const { firstName, password } = req.body;
    let checkCustomer = await models.customer.findOne({ where: { firstName: firstName } });
    if (!checkCustomer) {
        return res.status(404).json({ message: 'Wrong Credentials' })
    }
    let customerDetails = await checkCustomer.comparePassword(password);
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
        const decoded = jwt.verify(Token, JWT_SECRETKEY);
        const createdTime = new Date(decoded.iat * 1000).toGMTString();
        await models.customer.update({ lastLogin: createdTime }, {
            where: { id: decoded.id }
        });

        return res.status(200).json({ message: 'login successful', Token });
    } else {
        res.status(401).json({ message: 'Wrong Credentials' });
    }

}