module.exports = (sequelize, DataTypes) => {
    const IdentityProofImage = sequelize.define('identityProofImage', {
        // attributes
        customerKycPersonalDetailId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_personal_detail_id',
        },
        identityProofId: {
            type: DataTypes.INTEGER,
            field: 'identity_proof_id'
        },
        
    }, {
        freezeTableName: true,
        tableName: 'loan_identity_proof_image',
    });

    IdentityProofImage.associate = function (models) {
        IdentityProofImage.belongsTo(models.fileUpload, { foreignKey: 'identityProofId', as: 'identityProof' });

    }

    return IdentityProofImage;
}