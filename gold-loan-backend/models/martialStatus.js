module.exports = (sequelize, DataTypes) => {
    const MartialStatus = sequelize.define('martialStatus', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
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
        tableName: 'martial_status',
        timestamps: false
    });

  
    return MartialStatus;
}