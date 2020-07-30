module.exports = (sequelize, DataTypes) => {
    const ScrapStage = sequelize.define('scrapStage', {
        stageName: {
            type: DataTypes.STRING,
            field: 'stage_name',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_stage',
    });

    return ScrapStage;
}