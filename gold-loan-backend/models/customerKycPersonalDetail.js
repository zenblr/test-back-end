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
            type: DataTypes.TEXT,
            field: 'profile_image'
        },
        firstName: {
            type: DataTypes.STRING,
            field: 'first_name',
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            field: 'last_name',
            allowNull: false
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            field: 'dateOfBirth'
        },
        alternateMobileNumber: {
            type: DataTypes.STRING,
            field: 'alternate_mobile_number',
        },
        panCardNumber: {
            type: DataTypes.STRING,
            field: 'pan_card_number',
        },
        age: {
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
        identityProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'identity_proof'
        },
        identityProofNumber: {
            type: DataTypes.STRING,
            field: 'identity_proof_number',
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
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        createdByCustomer: {
            type: DataTypes.INTEGER,
            field: 'created_by_customer',
        },
        modifiedByCustomer: {
            type: DataTypes.INTEGER,
            field: 'modified_by_customer',
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

        CustomerKycPersonalDetail.belongsTo(models.customer, { foreignKey: 'createdByCustomer', as: 'CreatedbyCustomer' });
        CustomerKycPersonalDetail.belongsTo(models.customer, { foreignKey: 'createdByCustomer', as: 'ModifiedbyCustomer' });

    
        
    }

    CustomerKycPersonalDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        let identityProofImage = []
        if (values.identityProof) {
            for (imgUrl of values.identityProof) {
                let URL = process.env.BASE_URL + imgUrl;
                identityProofImage.push(URL)
            }
        }

        if (values.profileImage) {
            values.profileImg = process.env.BASE_URL + values.profileImage;

        }
        if (values.signatureProof) {
            values.signatureProofImg = process.env.BASE_URL + values.signatureProof;
        }
        values.identityProofImage = identityProofImage

        return values;
    }



    return CustomerKycPersonalDetail;
}