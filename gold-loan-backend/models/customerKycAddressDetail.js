
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
        addressProofTypeId: {
            type: DataTypes.INTEGER,
            field: 'address_proof_type_id'
        },
        // addressProof: {
        //     type: DataTypes.ARRAY(DataTypes.INTEGER),
        //     field: 'address_proof'
        // },
        addressProofNumber: {
            type: DataTypes.STRING,
            field: 'address_proof_number',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }

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

        CustomerKycAddressDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKycAddressDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        CustomerKycAddressDetail.hasMany(models.addressProofImage, { foreignKey: 'customerKycAddressDetailId', as: 'addressProofImage' });

    }


    CustomerKycAddressDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.addressProofImage) {
            for (image of values.addressProofImage) {
                image.addressProof.URL = process.env.BASE_URL + image.addressProof.path;
            }
        }
        return values;
    }



    return CustomerKycAddressDetail;
}