module.exports = (sequelize, DataTypes) => {
    const customerLoanKycDetail = sequelize.define('customerLoanKycDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
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
        permanentAddState: {
            type: DataTypes.STRING,
            field: 'permanent_add_state'
        },
        permanentAddCity: {
            type: DataTypes.STRING,
            field: 'permanent_add_city'
        },
        permanentAddPin: {
            type: DataTypes.INTEGER,
            field: 'permanent_add_pin'
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
        residentialAddState: {
            type: DataTypes.STRING,
            field: 'residential_add_state'
        },
        residentialAddCity: {
            type: DataTypes.STRING,
            field: 'residential_add_city'
        },
        residentialAddPin: {
            type: DataTypes.INTEGER,
            field: 'residential_add_pin'
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
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_kyc_detail',
    });


    customerLoanKycDetail.associate = function (models) {
        customerLoanKycDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
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