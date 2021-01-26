const checkLib = require('../../../lib/checkLib');
const searchArray = require('../../../lib/searchArray');
const models = require("../../../models");
const productData = require('../../../utils/productData');

const sequelize = models.sequelize;
const {Op} = models.Sequelize;

exports.createCart = async (req, res) => {
        const customerId = req.userData.id;
        const {productSku, productWeight, productName, amount, productImage, quantity, metalType} = req.body;
    
        const checkProductExist = await models.digiGoldCart.findOne({where:{productSku, customerId}});
        if (!checkLib.isEmpty(checkProductExist)) {
            await sequelize.transaction(async (t) => {
                await models.digiGoldCart.update(
                  {quantity:(checkProductExist.quantity + quantity)},
                  { where:{productSku:productSku, customerId},transaction: t }
                );
            });
            return  res.status(200).json({ message: "Product quantity updated" });
        }else{
            await sequelize.transaction(async (t) => {
                await models.digiGoldCart.create(
                  { customerId, productSku,  productWeight, productName, amount, productImage, quantity, metalType},
                  { transaction: t }
                );
            });
            return res.status(200).json({message:"Product added to cart"});
        }

};

exports.readCart = async (req, res) => {
        const customerId = req.userData.id;
        const getCartDetails = await models.digiGoldCart.getCartDetails(customerId);
        if (getCartDetails.length === 0){
            return res.status(200).json({cartData:[]});
        }else{
            let totalAmountPayable = 0;
            let totalQuantity = 0;
            let totalWeight = 0;
            for(let ele of getCartDetails){
                totalQuantity = totalQuantity + ele.quantity;
                totalWeight = totalWeight + (parseFloat(ele.productWeight) * parseFloat(ele.quantity));
                totalAmountPayable = totalAmountPayable + (parseFloat(ele.amount) * parseFloat(ele.quantity));
                ele.dataValues.totalProductAmount = parseFloat(ele.amount) * parseFloat(ele.quantity);
            }
            const obj = {cartData:getCartDetails,totalAmountPayable,totalQuantity, totalWeight};
            return res.status(200).json(obj);
        }

};

exports.getCartCount = async (req, res) => {
    const customerId = req.userData.id;
    const getCartDetails = await models.digiGoldCart.getCartDetails(customerId);
    if (getCartDetails.length === 0){
        return res.status(200).json({ cartCount:0});
    }else{
        return res.status(200).json({cartCount:getCartDetails.length});
    }
};

exports.updateQuantity = async (req, res) => {
    const customerId = req.userData.id;
    const {productSku} = req.params;
    const {quantity} = req.body;
    const getCartDetails = await models.digiGoldCart.findOne({where:{customerId, productSku}});
    if (checkLib.isEmpty(getCartDetails)){
        return res.status(404).json({ message: "Data not found" });
    }else{
        await sequelize.transaction(async (t) => {
            await models.digiGoldCart.update(
              {quantity},
              { where:{productSku:productSku, customerId},transaction: t }
            );
        });
        return  res.status(200).json({ message: "Product quantity updated" });
    }
};

exports.deleteFromCart = async (req, res) => {
    const {productSku} = req.params;
    const customerId = req.userData.id;
    const getCartDetails = await models.digiGoldCart.findOne({where:{customerId, productSku}});
    if (checkLib.isEmpty(getCartDetails)){
        return res.status(404).json({ message: "Data not found" });
    }else{
        await sequelize.transaction(async (t) => {
            await models.digiGoldCart.destroy(
              { where:{productSku, customerId},transaction: t }
            );
        });
        return  res.status(200).json({ message: "Product has been removed" });
    }
};
//Add items to cart for reorder purpose
exports.reAddItemsToCart = async (req, res) => {
    const customerId = req.userData.id;
    const {productDetails} = req.body;
    const productResult = await productData();

    for(let ele of productDetails){
        var searchResult = searchArray(ele.sku, "sku", productResult.result.data);
        const checkProductExist = await models.digiGoldCart.findOne({where:{productSku:ele.sku,customerId}});
        if (!checkLib.isEmpty(checkProductExist)) {
            await sequelize.transaction(async (t) => {
                await models.digiGoldCart.update(
                  {quantity:(checkProductExist.quantity + parseInt(ele.quantity))},
                  { where:{productSku:ele.sku, customerId},transaction: t }
                );
            });
        }else{
            await sequelize.transaction(async (t) => {
                await models.digiGoldCart.create(
                {
                    customerId, 
                    productSku:ele.sku,
                    productWeight:parseFloat(searchResult.productWeight),
                    productName:ele.productName,
                    amount:parseFloat(ele.price),
                    productImage:(ele.productImages.length == 0)? null :ele.productImages[0].url,
                    quantity:parseInt(ele.quantity),
                    metalType:ele.metalType    
                },
                  { transaction: t }
                );
            });
        }
    }
    return res.status(200).json({message:"Product added to cart"});
};