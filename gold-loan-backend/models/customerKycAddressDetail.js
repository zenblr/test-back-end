module.exports = (sequelize, DataTypes) => {
    const CustomerKycAddressDetail = sequelize.define('customerKycAddressDetail', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        customerKycId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_id',
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
            field: 'pin_code'
        },
        addressProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'address_proof'
        },
        addressProofNumber: {
            type: DataTypes.STRING,
            field: 'address_proof_number',
        },

    }, {
        freezeTableName: true,
        tableName: 'customer_kyc_address_detail',
    });


    CustomerKycAddressDetail.associate = function (models) {


        CustomerKycAddressDetail.belongsTo(models.customerKyc, { foreignKey: 'customerKycId', as: 'customerKyc' });
        CustomerKycAddressDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });


        CustomerKycAddressDetail.belongsTo(models.addressProofType, { foreignKey: 'addressProofTypeId', as: 'addressProofType' });

        CustomerKycAddressDetail.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        CustomerKycAddressDetail.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });
    }



    return CustomerKycAddressDetail;
}