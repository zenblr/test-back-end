const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const customerLoanBankDetail = sequelize.define('customerLoanBankDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        paymentType: {
            type: DataTypes.TEXT,
            field: 'payment_type'
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        bankBranchName:{
            type: DataTypes.STRING,
            field: 'bank_branch_name'
        },
        accountType:{
            type: DataTypes.STRING,
            field: 'account_type',
        },
        accountHolderName:{
            type: DataTypes.STRING,
            field: 'account_holder_name'
        },
        accountNumber: {
            type: DataTypes.STRING,
            field: 'account_number'
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code'
        },
        // passbookProof: {
        //     type: DataTypes.ARRAY(DataTypes.TEXT),
        //     field: 'passbook_proof'
        // },
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
        tableName: 'customer_loan_bank_detail',
    });


    customerLoanBankDetail.associate = function (models) {
        customerLoanBankDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });

        customerLoanBankDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoanBankDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        customerLoanBankDetail.hasMany(models.passbookProofImage, { foreignKey: 'customerLoanBankDetailId', as: 'passbookProofImage' });

    }
    
    customerLoanBankDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.identityProofImages) {
            for (image of values.identityProofImages) {
                image.URL = baseUrlConfig.BASEURL + image.url;
                let filePath = image.url;
                let pathToadd = filePath.replace('public/', '');
                image.URL = baseUrlConfig.BASEURL + pathToadd;
            }
        }
        return values;
    }

    // FUNCTION TO ADD CUSTOMER BANK DETAIL
    customerLoanBankDetail.addCustomerBankDetail =
        (loanId, name, accountNumber, ifscCode, createdBy, modifiedBy, t) => customerLoanBankDetail.create({
            loanId, name, accountNumber, ifscCode, createdBy, modifiedBy, isActive: true
        }, { t });

    return customerLoanBankDetail;
}