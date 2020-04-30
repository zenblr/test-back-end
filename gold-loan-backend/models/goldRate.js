module.exports = (sequelize, DataTypes) => {
    const GoldRate = sequelize.define('goldRate', {
        // attributes
        goldRate: {
            type: DataTypes.INTEGER,
            field: 'gold_rate',
            allowNull: false,
        },
        previousGoldRate: {
            type: DataTypes.INTEGER,
            field: 'previous_gold_rate',
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false
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
        tableName: 'gold_rate',
    });


    GoldRate.associate = function(models) {
        GoldRate.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        GoldRate.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return GoldRate;
}