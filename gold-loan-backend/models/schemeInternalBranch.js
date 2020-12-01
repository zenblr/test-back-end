module.exports = (sequelize, DataTypes) => {
    const SchemeInternalBranch = sequelize.define('schemeInternalBranch', {
        //attribute
        schemeId: {
            type: DataTypes.INTEGER,
            field: 'scheme_id'
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'loan_scheme_internal_branch',
        },
    )
    SchemeInternalBranch.associate = function (models) {

        // SchemeInternalBranch.belongsTo(models.scheme, { foreignKey: 'schemeId', as: 'scheme' })
        // SchemeInternalBranch.belongsTo(models.internalBranch, { foreignKey: 'internalBranchId', as: 'internalBrnach' })

    }

    return SchemeInternalBranch;

}
