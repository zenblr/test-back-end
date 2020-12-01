module.exports = (sequelize, DataTypes) => {
    const DigiGoldOrderBankDetail = sequelize.define('digiGoldOrderBankDetail', {
        orderDetailId: {
            type: DataTypes.INTEGER,
            field: 'order_detail_id'
        },
        accountNumber: {
            type: DataTypes.STRING,
            field: 'account_number'
        },
        bankId: {
            type: DataTypes.STRING,
            field: 'bank_id'
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        ifscCode:{
            type:DataTypes.STRING,
            field:'ifsc_code',
        },
        userBankId:{
            type:DataTypes.STRING,
            field:'user_bank_id',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },

    },
        {
            freezeTableName: true,
            tableName: 'digi_gold_order_bank_detail',
        }
    )

    DigiGoldOrderBankDetail.associate = (models) => {
        DigiGoldOrderBankDetail.belongsTo(models.digiGoldOrderDetail, { foreignKey: 'orderDetailId', as: 'orderDetail' });
    }
    
    return DigiGoldOrderBankDetail;
}