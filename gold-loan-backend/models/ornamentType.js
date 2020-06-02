module.exports = (sequelize, DataTypes) => {
    const OrnamentType = sequelize.define('ornamentType', {
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    },
        {
            freezeTableName: true,
            tableName: 'loan_ornament_type',
        }
    );

    return OrnamentType;
}