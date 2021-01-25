module.exports = (sequelize, DataTypes) => {
    const Merchant = sequelize.define('merchant', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        merchantName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'merchant_name'
        },
        allProductAccess:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,
            field:'all_product_access'
        },
        initial:{
            type:DataTypes.STRING,
            field:'initial'
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'status'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        freezeTableName: true,
        tableName: 'emi_merchant'
    });

    Merchant.associate = function (models) {
        Merchant.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        Merchant.hasMany(models.broker, { as: 'broker' });
        Merchant.hasOne(models.digiGoldMerchantDetails, { foreignKey: 'merchant_id', as: 'digiGoldMerchantDetails' });

    }
        return Merchant;
    }
