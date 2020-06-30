module.exports = (sequelize, DataTypes) => {
    const MerchantApiKey = sequelize.define('merchantApikey', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field:'user_id'
        },
        apiKey:{
            type: DataTypes.STRING,
            field:'api_key'
        },
        apiKeyStatus:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,
            field:'api_key_status'
        },
        isActive:{
            type:DataTypes.BOOLEAN,
            defaultValue:true,
            field:'is_active'
        },
        createdBy:{
            type:DataTypes.INTEGER,
            allowNull: false,
            field:'created_by'
        },
        updatedBy:{
            type:DataTypes.INTEGER,
            allowNull: false,
            field:'updated_by'
        }
    }, {
            freezeTableName: true,
            tableName: 'emi_merchant_apikey'
        }); 

        MerchantApiKey.associate = function (models) {
            MerchantApiKey.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        MerchantApiKey.belongsTo(models.user, { foreignKey: 'createdBy', as: 'createdByUser' });
        MerchantApiKey.belongsTo(models.user, { foreignKey: 'updatedBy', as: 'updatedByUser' });
        
        }
 
        return MerchantApiKey;
    }