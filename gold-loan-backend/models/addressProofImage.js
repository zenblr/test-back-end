module.exports = (sequelize, DataTypes) => {
    const AddressProofImage = sequelize.define('addressProofImage', {
        // attributes
        customerKycAddressDetailId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_address_detail_id',
        },
        addressProofId: {
            type: DataTypes.INTEGER,
            field: 'address_proof_id'
        },
        
    }, {
        freezeTableName: true,
        tableName: 'loan_address_proof_image',
    });

    AddressProofImage.associate = function (models) {
        AddressProofImage.belongsTo(models.fileUpload, { foreignKey: 'addressProofId', as: 'addressProof' });
    }

    return AddressProofImage;
}