module.exports = (sequelize, DataTypes) => {
    const customerLoanPersonalDetail = sequelize.define('customerLoanPersonalDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        customerUniqueId: {
            type: DataTypes.STRING,
            field: 'customer_unique_id'
        },
        mobile: {
            type: DataTypes.STRING,
            field: 'mobile'
        },
        panCardNumber: {
            type: DataTypes.STRING,
            field: 'pan_card_number',
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATE,
            field: 'start_date',
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
        tableName: 'customer_loan_personal_detail',
    });


    customerLoanPersonalDetail.associate = function (models) {
        customerLoanPersonalDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
    }

    // FUNCTION TO ADD CUSTOMER PERSONAL DETAIL
    customerLoanPersonalDetail.addCustomerPersonalDetail =
        (loanId, customerUniqueId, mobile, panCardNumber, startDate, createdBy, modifiedBy, t) => customerLoanPersonalDetail.create({
            loanId, customerUniqueId, mobile, panCardNumber, startDate, createdBy, modifiedBy, isActive: true
        }, { t });


    return customerLoanPersonalDetail;
}