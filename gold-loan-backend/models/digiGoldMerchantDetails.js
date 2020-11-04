const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const DigiGoldMerchantDetails = sequelize.define('digiGoldMerchantDetails', {
        merchantId: {
            type: DataTypes.INTEGER,
            allowNull:true,
            field: 'merchant_id'
        },
        email: {
            type: DataTypes.STRING,
            field: 'email'
        },
        password: {
            type: DataTypes.TEXT,
            field: 'password'
        },
        augmontMerchantId: {
            type: DataTypes.INTEGER,
            allowNull:true,
            field: 'augmont_merchant_id'
        },
        accessToken: {
            type: DataTypes.TEXT,
            allowNull:true,
            field: 'access_token'
        },
        lastTokenUpdated: {
            type: DataTypes.DATE,
            allowNull:true,
            field: 'last_token_updated'
        },
        expiresAt:{
            type: DataTypes.DATE,
            allowNull:true,
            field: 'expiresAt'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }

    },
        {
            freezeTableName: true,
            tableName: 'digital_gold_merchant_details',
        })

        DigiGoldMerchantDetails.associate = function (models) {
            DigiGoldMerchantDetails.belongsTo(models.merchant, { foreignKey: 'merchantId', as: 'digiGoldMerchantDetails' });
        }

    return DigiGoldMerchantDetails;
}