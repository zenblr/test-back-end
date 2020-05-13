module.exports = (sequelize, DataTypes) => {
    const FeedBack = sequelize.define('feedBack', {
        // attributes
        customerName: {
            type: DataTypes.STRING,
            field: 'customer_name',
            allowNull: false,
        },
        contactNumber: {
            type: DataTypes.BIGINT,
            field: 'contact_number',
            allowNull: false,
        },
        feedBack:{
            type:DataTypes.TEXT,
            field:'feed_back'
        },
        rating:{
            type:DataTypes.INTEGER,
            field:'rating',
            defaultValue: 1,
            validate: {
                min: 1,
                max: 5
              }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
        customerId:{
            type:DataTypes.INTEGER,
            field:'customer_id'
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'feed_back',
    });
    FeedBack.associate = function(models) {
        FeedBack.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }

    return FeedBack;
}