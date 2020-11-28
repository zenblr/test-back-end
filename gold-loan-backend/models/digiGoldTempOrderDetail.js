module.exports = (sequelize, DataTypes) => {

    const DigiGoldTempOrderDetail = sequelize.define('digiGoldTempOrderDetail', {
        // attributes

        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        orderTypeId: {
            type: DataTypes.INTEGER,
            field: 'order_type_id',
            allowNull: false
        },
        totalAmount: {
            type: DataTypes.STRING,
            field: 'total_amount',
            defaultValue: true,
        },
        coupanCode: {
            type: DataTypes.STRING,
            field: 'coupan_code',
            defaultValue: true,
        },
        walletBalance: {
            type: DataTypes.STRING,
            field: 'wallet_balance',
            defaultValue: true,
        },
        metalType: {
            type: DataTypes.STRING,
            field: 'metal_type',
            defaultValue: true,
        },
        goldBalance: {
            type: DataTypes.STRING,
            field: 'gold_balance',
            defaultValue: true,
        },
        silverBalance: {
            type: DataTypes.STRING,
            field: 'silver_balance',
            defaultValue: true,
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
        tableName: 'digi_gold_temp_order_detail',
    });

    // DigiGoldConfigDetails.associate = function(models) {
    // GlobalSetting.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });

    // }


    return DigiGoldTempOrderDetail;
}