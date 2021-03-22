const models = require('.');
// const financialYearDetails = require('../utils/financialYearDetails');
module.exports = (sequelize, DataTypes) => {
    const Orders = sequelize.define('orders', {
        // attributes
        //orderId
        blockId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'block_Id'
        },
        orderUniqueId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'order_unique_id'
        },
        proformaInvoiceNo: {
            type: DataTypes.STRING,
            field: 'proforma_invoice_no',
        },
        invoiceNumber: {
            type: DataTypes.STRING,
            field: 'invoice_number',
        },
        invoiceDate: {
            type: DataTypes.DATE,
            field: 'invoice_date',
        },
        orderReferenceNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'order_reference_number'
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'customer_id'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'created_by'
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'updated_by'
        },
        productId: {
            type: DataTypes.INTEGER,
            field: 'product_id'
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'weight'
        },
        quantity: {
            type: DataTypes.INTEGER,
            field: 'quantity',
            defaultValue: 1
        },
        paymentTypeId: {
            type: DataTypes.INTEGER,
            field: 'payment_type_id'
        },
        numberOfPendingEmi: {
            type: DataTypes.INTEGER,
            field: 'number_of_pending_emi'
        },
        orderByUserId: {
            type: DataTypes.INTEGER,
            field: 'order_by_user_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        orderStatusId: {
            type: DataTypes.STRING,
            field: 'order_status'
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        },
        currentWalletBalance: {
            type: DataTypes.FLOAT,
            field: 'current_wallet_balance',
        },
        walletId: {
            type: DataTypes.INTEGER,
            field: 'wallet_id',
        },

    }, {
        freezeTableName: true,
        tableName: 'emi_orders',
    });

    Orders.associate = function (models) {
        // Orders.belongsTo(models.orderStatus, { foreignKey: 'orderStatusId', as: 'orderCurrentStatus' });
        // Orders.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customerDetails' });
        // Orders.belongsTo(models.products, { foreignKey: 'productId', as: 'product' });
        // Orders.belongsTo(models.user, { foreignKey: 'createdBy', as: 'orderBy' });
        // Orders.belongsTo(models.paymentType, { foreignKey: 'paymentTypeId', as: 'paymentType' });
        // Orders.belongsTo(models.productPrice, { foreignKey: 'productId', as: 'price' });
        // Orders.hasMany(models.orderDetails, { foreignKey: 'orderId', as: 'orderdetails' });
        Orders.hasMany(models.orderEmiDetails, { foreignKey: 'orderId', as: 'orderemidetails' });
        // Orders.hasMany(models.orderTrackings, { foreignKey: 'orderId', as: 'ordertracking' });
        // Orders.belongsTo(models.user, { foreignKey: 'updatedBy', as: 'orderUpdatedBy' });
        // Orders.belongsTo(models.tempOrders, { foreignKey: 'blockId', as: 'blockDetails' });
        // Orders.belongsTo(models.user, { foreignKey: 'orderByUserId', as: 'orderByUserDetails' });
        // // Orders.hasMany(models.cart, { foreignKey: 'cart_id', as: 'orderCart' });
        // Orders.hasMany(models.customerOrderAddress, { foreignKey: 'orderId', as: 'customerOrderAddress' });
        Orders.belongsTo(models.walletDetails, { foreignKey: 'walletId', as: 'walletDetails' });
    }
    // Orders.prototype.toJSON = function () {
    //     var values = Object.assign({}, this.get({ plain: true }));
    //     var resOrna = []
    
    //     //productImages
    //     if (values.product) {
    //         let ProductImage = [];
    //         if (values.product.productImages) {
    //             for (image of values.product.productImages){
    //                 let pathToadd = image.url.replace('public/','');
    //                 console.log(pathToadd);
    //                 let URL = process.env.BASE_URL + pathToadd;
    //                 image.URL = URL;
    //             }
    //         }
    //     }
    //     return values;
    // }

    // Orders.createOrder = async ({ customerId, createdBy, internalBranchId, productDetails, blockId, orderByUserId, invoiceInitial, orderStatusId, paymentMode }) => {
    //     let placedOrderDetails = [];
    //     for (let i = 0; i < productDetails.length; i++) {
    //         let dateInfo = await financialYearDetails.getFinancialYear();
    //         let orderUniqueId = await Math.floor((Math.random() * 1000000) + 1);
    //         let proformaInvoiceNo = await `${invoiceInitial}${dateInfo.currentMonth}${dateInfo.invoiceYear}${orderUniqueId}`;
    //         let productId = productDetails[i].productId;
    //         let paymentTypeId = productDetails[i].paymentTypeId;
    //         let quantity = productDetails[i].quantity;
    //         let weight = productDetails[i].weight;
    //         var orderStatusId = 1;
    //         if (paymentTypeId == 1) {
    //             var numberOfPendingEmi = 3;
    //             if (paymentMode == "paymentGateway" || paymentMode == "augmontWallet") {
    //                 orderStatusId = 2;
    //             } else {
    //                 orderStatusId = 1;
    //             }
    //         } else if (paymentTypeId == 2) {
    //             if (paymentMode == "paymentGateway" || paymentMode == "augmontWallet") {
    //                 orderStatusId = 2;
    //             } else {
    //                 orderStatusId = 1;
    //             }
    //             var numberOfPendingEmi = 6;
    //         } else if (paymentTypeId == 3) {
    //             if (paymentMode == "paymentGateway" || paymentMode == "augmontWallet") {
    //                 orderStatusId = 2;
    //             } else {
    //                 orderStatusId = 1;
    //             }
    //             var numberOfPendingEmi = 9;
    //         } else if (paymentTypeId == 4) {
    //             if (paymentMode == "paymentGateway" || paymentMode == "augmontWallet") {
    //                 orderStatusId = 12;
    //             } else {
    //                 orderStatusId = 1;
    //             }
    //             var numberOfPendingEmi = 0;
    //         }
    //         var placeOrder = await Orders.create({ orderByUserId, blockId, orderUniqueId, customerId, createdBy, updatedBy: createdBy, paymentTypeId, productId, quantity, numberOfPendingEmi, orderStatusId, isActive: true, weight, proformaInvoiceNo, internalBranchId });
    //         placedOrderDetails.push(placeOrder);
    //     }
    //     return placedOrderDetails;
    // }

    return Orders;
}
