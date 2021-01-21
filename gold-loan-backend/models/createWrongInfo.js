module.exports = (sequelize, DataTypes) => {
    const createWrongInfo = sequelize.define('createWrongInfo', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
        },
        error: {
            type: DataTypes.TEXT,
            field: 'error',
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'create_wrong_info',
        timestamps: false
    });

    return createWrongInfo;
}