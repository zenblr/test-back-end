module.exports = (sequelize, DataTypes) => {
    const KycCustomerPersonalDetail = sequelize.define('kycCustomerPersonalDetail', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        profileImage: {
            type: DataTypes.TEXT,
            field: 'profile_image'
        },
        firstName: {
            type: DataTypes.STRING,
            field: 'first_name',
            validate: {
                len: {
                    args: [0, 30]
                }
            },
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            field: 'last_name',
            validate: {
                len: {
                    args: [0, 30]
                }
            },
            allowNull: false
        },
        mobileNumber: {
            type: DataTypes.STRING,
            field: 'mobile_number',
            allowNull: false,
        },
        panCardNumber: {
            type: DataTypes.STRING,
            field: 'pan_card_number',
        },
        gender: {
            type: DataTypes.ENUM,
            field: 'gender',
            values: ['m', 'f', 'o']
        },
        martialStatus: {
            type: DataTypes.ENUM,
            field: 'martial_status',
            values: ['single', 'married', 'divorced']
        },
        occupationId: {
            type: DataTypes.INTEGER,
            field: 'occupation_id'
        },
        identityTypeId: {
            type: DataTypes.INTEGER,
            field: 'identity_type_id'
        },
        identityProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'identity_proof'
        },
        spouseName: {
            type: DataTypes.STRING,
            field: 'spouse_name',
        },
        signatureProof: {
            type: DataTypes.TEXT,
            field: 'signature_proof'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false,
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false,
        },
        isKycDone: {
            type: DataTypes.BOOLEAN,
            field: 'is_kyc_done',
            defaultValue: false,
        },
        isKyVerify: {
            type: DataTypes.BOOLEAN,
            field: 'is_kyc_verify',
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_kyc_personal_detail',
    });


    KycCustomerPersonalDetail.associate = function (models) {

        KycCustomerPersonalDetail.hasMany(models.kycCustomerAddressDetail, { foreignKey: 'customerKycId', as: 'customerKycAddress' });
        KycCustomerPersonalDetail.hasMany(models.kycCustomerBankDetail, { foreignKey: 'customerKycId', as: 'customerKycBank' });


        KycCustomerPersonalDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        KycCustomerPersonalDetail.belongsTo(models.occupation, { foreignKey: 'occupationId', as: 'occupation' });
        KycCustomerPersonalDetail.belongsTo(models.identityType, { foreignKey: 'identityTypeId', as: 'identityType' });


        KycCustomerPersonalDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        KycCustomerPersonalDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }



    return KycCustomerPersonalDetail;
}