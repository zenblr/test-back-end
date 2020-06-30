module.exports = (sequelize, DataTypes) => {
    const PassbookProofImage = sequelize.define('passbookProofImage', {
        // attributes
        customerLoanBankDetailId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_bank_detail_id',
        },
        passbookProofId: {
            type: DataTypes.INTEGER,
            field: 'passbook_proof_id'
        },
        
    }, {
        freezeTableName: true,
        tableName: 'loan_passbook_proof_image',
    });

    PassbookProofImage.associate = function (models) {
        PassbookProofImage.belongsTo(models.fileUpload, { foreignKey: 'passbookProofId', as: 'passbookProof' });

    }

    return PassbookProofImage;
}