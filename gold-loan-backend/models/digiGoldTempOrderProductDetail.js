module.exports = (sequelize, DataTypes) => {

    const DigiGoldTempOrderProductDetail = sequelize.define('digiGoldTempOrderProductDetail', {
        // attributes
        productSku: {
            type: DataTypes.STRING,
            field: 'product_sku',
            allowNull: false
        },
        productWeight: {
            type: DataTypes.STRING,
            field: 'product_weight',
            allowNull: false
        },
        productName: {
            type: DataTypes.STRING,
            field: 'product_Name',
            allowNull: false
        },
        amount: {
            type: DataTypes.STRING,
            field: 'amount',
            allowNull: false
        },
        productImage: {
            type: DataTypes.STRING,
            field: 'product_Image',
            allowNull: false
        },
        amount: {
            type: DataTypes.STRING,
            field: 'amount',
            allowNull: false
        },
        orderId: {
            type: DataTypes.STRING,
            field: 'order_id',
            allowNull: false
        },

        totalAmount: {
            type: DataTypes.STRING,
            field: 'total_amount',
            defaultValue: true,
        },
        metalType: {
            type: DataTypes.STRING,
            field: 'metal_type',
            defaultValue: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            field: 'quantity'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false
        },

    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_temp_order_product_detail',
    });

    // DigiGoldConfigDetails.associate = function(models) {
    // GlobalSetting.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });

    // }


    return DigiGoldTempOrderProductDetail;
}