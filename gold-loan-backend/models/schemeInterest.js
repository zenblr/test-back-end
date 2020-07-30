module.exports = (sequelize, DataTypes) => {
    const SchemeInterest = sequelize.define('schemeInterest', {
        //attribute
        schemeId: {
            type: DataTypes.INTEGER,
            field: 'scheme_id'
        },
        days: {
            type: DataTypes.INTEGER,
            field: 'days'
        },
        interestRate: {
            type: DataTypes.FLOAT,
            field: 'interest_rate'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'loan_scheme_interest',
        },
    )
    SchemeInterest.associate = function (models) {

        SchemeInterest.belongsTo(models.scheme, { foreignKey: 'schemeId', as: 'scheme' })

    }

    return SchemeInterest;

}
