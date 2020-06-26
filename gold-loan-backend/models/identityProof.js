module.exports = (sequelize, DataTypes) => {
    const IdentityProof = sequelize.define('identityProof', {
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
        tableName: 'loan_identity_proof',
    });

    IdentityProof.associate = function (models) {
        IdentityProof.belongsTo(models.fileUpload, { foreignKey: 'identityProofId', as: 'identityProof' });

    }

    return IdentityProof;
}