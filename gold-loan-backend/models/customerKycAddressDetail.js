module.exports = (sequelize, DataTypes) => {
    const KycCustomerAddressDetail = sequelize.define('kycCustomerAddressDetail', {
        // attributes
        customerKycId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_id',
            allowNull: false
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        addressType: {
            type: DataTypes.ENUM,
            field: 'address_type',
            values: ['permanent', 'residential']
        },
        address: {
            type: DataTypes.TEXT,
            field: 'address',
            allowNull: false
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id',
            allowNull: false,
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id',
            allowNull: false,
        },
        pinCode: {
            type: DataTypes.INTEGER,
            field: 'pinCode'
        },
        addressProofTypeId: {
            type: DataTypes.INTEGER,
            field: 'address_proof_type_id'
        },
        addressProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'address_proof'
        }

    }, {
        freezeTableName: true,
        tableName: 'customer_kyc_address_detail',
    });


    KycCustomerAddressDetail.associate = function (models) {


        KycCustomerAddressDetail.belongsTo(models.kycCustomerPersonalDetail, { foreignKey: 'customerKycId', as: 'customerKyc' });
        KycCustomerAddressDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });


        KycCustomerAddressDetail.belongsTo(models.addressProofType, { foreignKey: 'addressProofTypeId', as: 'addressProofType' });

        KycCustomerAddressDetail.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        KycCustomerAddressDetail.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });
    }



    return KycCustomerAddressDetail;
}