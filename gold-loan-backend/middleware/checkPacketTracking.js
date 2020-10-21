const models = require('../models');


module.exports = async (req, res, next) => {
    const authenticationKey = await req.headers.key
    try {
        if (req.useragent.isMobile) {
            let checkUser = await models.user.findOne({
                where: {
                    id: req.userData.id
                },
                attributes: ['authenticationKey', 'id']
            })
            if (authenticationKey != checkUser.authenticationKey) {
                return res.status(401).json({ message: `You are unauthorized user please contact admin` })
            } else {
                next();
            }
        } else {
            next();
        }
    } catch (error) {
        return res.status(401).json({ message: `Internal server error.` });
    }

}