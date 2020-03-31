module.exports = (sequelize, DataTypes) => {
    const Status = sequelize.define('status', {
        // attributes
        statusName: {
            type: DataTypes.STRING,
            field: 'status_name',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'status',
    });

    return Status;
}