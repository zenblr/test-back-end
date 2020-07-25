module.exports = (sequelize, DataTypes) => {
    const PartReleaseHistory = sequelize.define('partReleaseHistory', {
        // attributes
        partReleaseId:{
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

    PartReleaseHistory.associate = function(models) {
        PartReleaseHistory.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        PartReleaseHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        PartReleaseHistory.belongsTo(models.partRelease, { foreignKey: 'partReleaseId', as: 'partRelease' });

    }

    return PartReleaseHistory;
}