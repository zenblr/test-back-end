module.exports = (sequelize, DataTypes) => {
    const Stage = sequelize.define('stage', {
        // attributes
        stageName: {
            type: DataTypes.STRING,
            field: 'stage_name',
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
        tableName: 'stage',
    });

    return Stage;
}