module.exports = (sequelize, DataTypes) => {
    const Stage = sequelize.define('stage', {
        // attributes
        stageName: {
            type: DataTypes.STRING,
            field: 'stage_name',
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'stage',
    });

    return Stage;
}