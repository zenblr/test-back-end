module.exports = (sequelize, DataTypes) => {
    const GoldRateHistory = sequelize.define('goldRateHistory', {
        // attributes
        goldRate: {
            type: DataTypes.STRING,
            field: 'gold_rate',
            allowNull: false,
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false
        },
        modifiedTime: {
            type: DataTypes.DATE,
            field: 'modified_time',
            allowNull: false
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'gold_rate_history',
    });


    GoldRateHistory.associate = function(models) {
        GoldRateHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return GoldRateHistory;
}