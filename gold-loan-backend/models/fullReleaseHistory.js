module.exports = (sequelize, DataTypes) => {
    const FullReleaseHistory = sequelize.define('fullReleaseHistory', {
        // attributes
        fullReleaseId:{
            type: DataTypes.INTEGER,
            field: 'part_release_id'
        },
        action: {
            type: DataTypes.TEXT,
            field: 'action'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
    }, {
        freezeTableName: true,
        tableName: 'loan_part_release_history',
    });

    FullReleaseHistory.associate = function(models) {
        FullReleaseHistory.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        FullReleaseHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        FullReleaseHistory.belongsTo(models.fullRelease, { foreignKey: 'fullReleaseId', as: 'fullRelease' });

    }

    return FullReleaseHistory;
}