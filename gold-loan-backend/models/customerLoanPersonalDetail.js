module.exports = (sequelize, DataTypes) => {
    const customerLoanPersonalDetail = sequelize.define('customerLoanPersonalDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        customerUniqueId: {
            type: DataTypes.STRING,
            field: 'customer_unique_id'
        },
        purpose: {
            type: DataTypes.TEXT,
            field: 'purpose',
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATE,
            field: 'start_date',
        },
        kycStatus:{
            type: DataTypes.STRING,
            field: 'kyc_status',
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
        tableName: 'customer_loan_personal_detail',
    });


    customerLoanPersonalDetail.associate = function (models) {
        customerLoanPersonalDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
        customerLoanPersonalDetail.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        customerLoanPersonalDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoanPersonalDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    // FUNCTION TO ADD CUSTOMER PERSONAL DETAIL
    customerLoanPersonalDetail.addCustomerPersonalDetail =
        (loanId, customerUniqueId, mobile, panCardNumber, startDate, createdBy, modifiedBy, t) => customerLoanPersonalDetail.create({
            loanId, customerUniqueId, mobile, panCardNumber, startDate, createdBy, modifiedBy, isActive: true
        }, { t });


    return customerLoanPersonalDetail;
}