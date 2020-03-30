module.exports = (sequelize, DataTypes) => {
    const Status = sequelize.define('status', {
        // attributes
        statusName: {
            type: DataTypes.STRING,
            field: 'status_name',
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'status',
    });

    return Status;
}