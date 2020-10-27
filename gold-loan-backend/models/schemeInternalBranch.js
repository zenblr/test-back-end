module.exports = (sequelize, DataTypes) => {
    const SchemeInternalBranch = sequelize.define('schemeInternalBranch', {
        //attribute
        schemeId: {
            type: DataTypes.INTEGER,
            field: 'scheme_id'
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'days'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'scheme_internal_branch',
        },
    )
    SchemeInternalBranch.associate = function (models) {

        // SchemeInternalBranch.belongsTo(models.scheme, { foreignKey: 'schemeId', as: 'scheme' })
        // SchemeInternalBranch.belongsTo(models.internalBranch, { foreignKey: 'internalBranchId', as: 'internalBrnach' })

    }

    return SchemeInternalBranch;

}
