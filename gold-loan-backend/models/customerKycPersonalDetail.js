module.exports = (sequelize, DataTypes) => {
    const CustomerKycPersonalDetail = sequelize.define('customerKycPersonalDetail', {
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
        dateOfBirth: {
            type: DataTypes.DATE,
            field: 'dateOfBirth'
        },
        alternateMobileNumber: {
            type: DataTypes.STRING,
            field: 'alternate_mobile_number',
        },
        panCardNumber: {
            type: DataTypes.STRING,
            field: 'pan_card_number',
            allowNull: false
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
        kycStatus: {
            type: DataTypes.ENUM,
            field: 'kyc_status',
            defaultValue: "pending",
            values: ['confirm', 'pending','complete','closed']
        },
        isKycSubmitted: {
            type: DataTypes.BOOLEAN,
            field: 'is_kyc_submitted',
            defaultValue: false
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


    CustomerKycPersonalDetail.associate = function (models) {

        CustomerKycPersonalDetail.hasMany(models.customerKycAddressDetail, { foreignKey: 'customerKycId', as: 'customerKycAddress' });
        CustomerKycPersonalDetail.hasMany(models.customerKycBankDetail, { foreignKey: 'customerKycId', as: 'customerKycBank' });
        CustomerKycPersonalDetail.hasOne(models.customerKycClassification, { foreignKey: 'customerKycId', as: 'customerKycClassification' });

        CustomerKycPersonalDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        CustomerKycPersonalDetail.belongsTo(models.occupation, { foreignKey: 'occupationId', as: 'occupation' });
        CustomerKycPersonalDetail.belongsTo(models.identityType, { foreignKey: 'identityTypeId', as: 'identityType' });


        CustomerKycPersonalDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKycPersonalDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }



    return CustomerKycPersonalDetail;
}