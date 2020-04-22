module.exports = (sequelize, DataTypes) => {
    const KycCustomerAddressDetail = sequelize.define('kycCustomerAddressDetail', {
        // attributes
        kycCustomerId: {
            type: DataTypes.INTEGER,
            field: 'kyc_customer_id',
            allowNull: false
        },
        addressTypeId: {
            type: DataTypes.INTEGER,
            field: 'address_type_id'
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
        addressProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'address_proof'
        }

    }, {
        freezeTableName: true,
        tableName: 'kyc_customer_address_detail',
    });


    KycCustomerAddressDetail.associate = function (models) {


        KycCustomerAddressDetail.belongsTo(models.kycCustomerPersonalDetail, { foreignKey: 'kycCustomerId', as: 'kycCustomer' });

        KycCustomerAddressDetail.belongsTo(models.addressType, { foreignKey: 'addressTypeId', as: 'addressType' });
        KycCustomerAddressDetail.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        KycCustomerAddressDetail.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });
    }



    return KycCustomerAddressDetail;
}