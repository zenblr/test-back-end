module.exports = (sequelize, DataTypes) => {
    const PurityTestImage = sequelize.define('purityTestImage', {
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
        tableName: 'loan_purity_test_image',
    });

    PurityTestImage.associate = function (models) {
        PurityTestImage.belongsTo(models.fileUpload, { foreignKey: 'purityTestId', as: 'purityTest' });

    }

    return PurityTestImage;
}