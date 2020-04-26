module.exports = (sequelize, DataTypes) => {
    const Query = sequelize.define('query', {
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
        query:{
            type:DataTypes.TEXT,
            field:'query'
        },
        status:{
            type:DataTypes.STRING,
            field:'status',
            defaultValue:'pending'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
        // customerId:{
        //     type:DataTypes.INTEGER,
        //     field:'customer_id'
        // }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'query',
    });
    // Query.associate = function(models) {
    //     Query.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    // }

    return Query;
}