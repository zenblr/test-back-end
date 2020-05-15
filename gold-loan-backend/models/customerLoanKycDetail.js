module.exports = (sequelize, DataTypes) => {
    const customerLoanKycDetail = sequelize.define('customerLoanKycDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        identityTypeId: {
            type: DataTypes.INTEGER,
            field: 'identity_type_id'
        },
        identityProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'identity_proof'
        },
        idCardNumber: {
            type: DataTypes.STRING,
            field: 'id_card_number'
        },
        permanentAddress: {
            type: DataTypes.STRING,
            field: 'permanent_address'
        },
        permanentAddStateId: {
            type: DataTypes.INTEGER,
            field: 'permanent_add_state_id'
        },
        permanentAddCityId: {
            type: DataTypes.INTEGER,
            field: 'permanent_add_city_id'
        },
        permanentAddPin: {
            type: DataTypes.INTEGER,
            field: 'permanent_add_pin'
        },
        permanentAddProofTypeId: {
            type: DataTypes.INTEGER,
            field: 'permanent_add_proof_type_id'
        },
        permanentAddProof: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            field: 'permanent_add_proof'
        },
        permanentAddCardNumber: {
            type: DataTypes.STRING,
            field: 'permanent_add_card_number'
        },
        residentialAddress: {
            type: DataTypes.STRING,
            field: 'residential_address'
        },
        residentialAddStateId: {
            type: DataTypes.INTEGER,
            field: 'residential_add_state_id'
        },
        residentialAddCityId: {
            type: DataTypes.INTEGER,
            field: 'residential_add_city_id'
        },
        residentialAddPin: {
            type: DataTypes.INTEGER,
            field: 'residential_add_pin'
        },
        residentialAddProofTypeId: {
            type: DataTypes.INTEGER,
            field: 'residential_add_proof_type_id'
        },
        residentialAddProof: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            field: 'residential_add_proof'
        },
        residentialAddCardNumber: {
            type: DataTypes.STRING,
            field: 'residential_add_card_number'
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
        tableName: 'customer_loan_kyc_detail',
    });


    customerLoanKycDetail.associate = function (models) {
        customerLoanKycDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });

        customerLoanKycDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoanKycDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        customerLoanKycDetail.belongsTo(models.identityType, { foreignKey: 'identityTypeId', as: 'identityType' });

        customerLoanKycDetail.belongsTo(models.state, { foreignKey: 'permanentAddStateId', as: 'perState' });
        customerLoanKycDetail.belongsTo(models.city, { foreignKey: 'permanentAddCityId', as: 'perCity' });
        customerLoanKycDetail.belongsTo(models.addressProofType, { foreignKey: 'permanentAddProofTypeId', as: 'perAddressProofType' });

        customerLoanKycDetail.belongsTo(models.state, { foreignKey: 'residentialAddStateId', as: 'resState' });
        customerLoanKycDetail.belongsTo(models.city, { foreignKey: 'residentialAddCityId', as: 'resCity' });
        customerLoanKycDetail.belongsTo(models.addressProofType, { foreignKey: 'residentialAddProofTypeId', as: 'resAddressProofType' });

    }

    // FUNCTION TO ADD CUSTOMER KYC DETAIL
    customerLoanKycDetail.addCustomerKycDetail =
        (loanId, identityProof, idCardNumber, permanentAddress, permanentAddState, permanentAddCity, permanentAddPin, permanentAddProof,
            permanentAddCardNumber, residentialAddress, residentialAddState, residentialAddCity, residentialAddPin, residentialAddProof,
            residentialAddCardNumber, createdBy, modifiedBy, t) => customerLoanKycDetail.create({
                loanId, identityProof, idCardNumber, permanentAddress, permanentAddState, permanentAddCity, permanentAddPin, permanentAddProof,
                permanentAddCardNumber, residentialAddress, residentialAddState, residentialAddCity, residentialAddPin, residentialAddProof,
                residentialAddCardNumber, createdBy, modifiedBy, isActive: true
            }, { t });

    return customerLoanKycDetail;
}