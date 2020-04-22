module.exports = (sequelize, DataTypes) => {
    const KycCustomerPersonalDetail = sequelize.define('kycCustomerPersonalDetail', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customerId',
            allowNull: false
        },
        customerUniqueId:{
            type: DataTypes.STRING,
            field: 'customer_unique_id'
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
        email: {
            type: DataTypes.STRING,
            field: 'email',
            validate: {
                len: {
                    args: [0, 30]
                }
            }
        },
        panCardNumber: {
            type: DataTypes.STRING,
            field: 'pan_card_number',
        },
        gender: {
            type: DataTypes.STRING,
            field: 'gender'
        },
        martialStatusId: {
            type: DataTypes.INTEGER,
            field: 'martial_status_id'
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
        }
    }, {
        freezeTableName: true,
        tableName: 'kyc_customer_personal_detail',
    });


    KycCustomerPersonalDetail.associate = function(models) {

        KycCustomerPersonalDetail.hasMany(models.kycCustomerAddressDetail, { foreignKey: 'kycCustomerId', as: 'kycCustomerAddress' });
        KycCustomerPersonalDetail.hasMany(models.kycCustomerBankDetail, { foreignKey: 'kycCustomerId', as: 'kycCustomerBank' });


        KycCustomerPersonalDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        KycCustomerPersonalDetail.belongsTo(models.occupation, { foreignKey: 'occupationId', as: 'occupation' });
        KycCustomerPersonalDetail.belongsTo(models.identityType, { foreignKey: 'identityTypeId', as: 'identityType' });

        KycCustomerPersonalDetail.belongsTo(models.martialStatus, { foreignKey: 'martialStatusId', as: 'martialStatus' });

        KycCustomerPersonalDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        KycCustomerPersonalDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }



    return KycCustomerPersonalDetail;
}