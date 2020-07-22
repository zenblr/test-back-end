module.exports = (sequelize, DataTypes) => {
    const CustomerScrapCurrentStage = sequelize.define('customerScrapCurrentStage', {
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
        tableName: 'scrap_customer_scrap_current_stage',
    });

    return CustomerScrapCurrentStage;
}