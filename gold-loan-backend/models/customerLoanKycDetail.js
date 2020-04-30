module.exports = (sequelize, DataTypes) => {
    const customerLoanKycDetail = sequelize.define('customerLoanKycDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        aadharNumber: {
            type: DataTypes.STRING,
            field: 'aadhar_number'
        },
        permanentAddress: {
            type: DataTypes.STRING,
            field: 'permanent_address'
        },
        pincode: {
            type: DataTypes.STRING,
            field: 'pin_code'
        },
        officeAddress: {
            type: DataTypes.STRING,
            field: 'office_address'
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
        (loanId, aadharNumber, permanentAddress, pincode, officeAddress, t) => customerLoanKycDetail.create({
            loanId, aadharNumber, permanentAddress, pincode, officeAddress, isActive: true
        }, { t });

    return customerLoanKycDetail;
}