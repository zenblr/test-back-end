module.exports = (sequelize, DataTypes) => {
    const CustomerKycPersonalDetail = sequelize.define('customerKycPersonalDetail', {
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
        profileImage: {
            type: DataTypes.INTEGER,
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
        age:{
            type: DataTypes.STRING,
            field: 'age'
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
        // identityProof: {
        //     type: DataTypes.ARRAY(DataTypes.INTEGER),
        //     field: 'identity_proof'
        // },
        identityProofNumber: {
            type: DataTypes.STRING,
            field: 'identity_proof_number',
        },
        spouseName: {
            type: DataTypes.STRING,
            field: 'spouse_name',
        },
        signatureProof: {
            type: DataTypes.INTEGER,
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

        CustomerKycPersonalDetail.belongsTo(models.customerKyc, { foreignKey: 'customerKycId', as: 'customerKyc' });
        CustomerKycPersonalDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

        CustomerKycPersonalDetail.belongsTo(models.occupation, { foreignKey: 'occupationId', as: 'occupation' });
        CustomerKycPersonalDetail.belongsTo(models.identityType, { foreignKey: 'identityTypeId', as: 'identityType' });


        CustomerKycPersonalDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKycPersonalDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        CustomerKycPersonalDetail.belongsTo(models.fileUpload, { foreignKey: 'profileImage', as: 'profileImageData' });
        CustomerKycPersonalDetail.belongsTo(models.fileUpload, { foreignKey: 'signatureProof', as: 'signatureProofData' });

        CustomerKycPersonalDetail.hasMany(models.identityProof, { foreignKey: 'customerKycPersonalDetailID', as: 'identityProof' });
    }



    return CustomerKycPersonalDetail;
}