const models = require('../../models');

exports.readAllProduct = async (req, res, next) => {
    let readProductData = await models.product.getAllProduct();
    if (!readProductData) {
        return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json(readProductData);


}




