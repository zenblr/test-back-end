module.exports = (sequelize, DataTypes) => {
    const PurityTest = sequelize.define('purityTest', {
        // attributes
        customerLoanOrnamentsDetailId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_ornaments_detail_id',
        },
        purityTestId: {
            type: DataTypes.INTEGER,
            field: 'purity_test_id'
        },
        
    }, {
        freezeTableName: true,
        tableName: 'loan_purity_test',
    });

    PurityTest.associate = function (models) {
        PurityTest.belongsTo(models.fileUpload, { foreignKey: 'purityTestId', as: 'purityTest' });

    }

    return PurityTest;
}