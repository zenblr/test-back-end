module.exports = (sequelize, DataTypes) => {
    const PartReleaseOrnaments = sequelize.define('partReleaseOrnaments', {
        // attributes
        partReleaseId: {
            type: DataTypes.INTEGER,
            field: 'part_release_id'
        },
        ornamentId: {
            type: DataTypes.INTEGER,
            field: 'ornament_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'loan_part_release_ornaments'
    });

    PartReleaseOrnaments.associate = function(models) {
        // PartReleaseOrnaments.belongsTo(models.partRelease, { foreignKey: 'partReleaseId', as: 'partRelease' });
        // PartReleaseOrnaments.belongsTo(models.customerLoanOrnamentsDetail, { foreignKey: 'ornamentId', as: 'ornament' });
    }


    return PartReleaseOrnaments;
}