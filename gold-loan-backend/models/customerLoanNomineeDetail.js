module.exports = (sequelize, DataTypes) => {
    const customerLoanNomineeDetail = sequelize.define('customerLoanNomineeDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        nomineeName: {
            type: DataTypes.STRING,
            field: 'nominee_name'
        },
        nomineeAge: {
            type: DataTypes.INTEGER,
            field: 'nominee_age'
        },
        nomineeType: {
            type: DataTypes.ENUM,
            field: 'nominee_type',
            values: ['minor', 'major']
        },
        relationship: {
            type: DataTypes.STRING,
            field: 'relationship'
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
        tableName: 'customer_loan_nominee_detail',
    });


    customerLoanNomineeDetail.associate = function (models) {
        customerLoanNomineeDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
    }

    // FUNCTION TO ADD CUSTOMER NOMINEE DETAIL
    customerLoanNomineeDetail.addCustomerNomineeDetail =
        (loanId, nomineeData, createdBy, modifiedBy, t) => {
            let finalNomineeData = nomineeData.map(function (ele) {
                let obj = Object.assign({}, ele);
                obj.isActive = true;
                obj.loanId = loanId;
                obj.createdBy = createdBy;
                obj.modifiedBy = modifiedBy;
                return obj;
            })
            return customerLoanNomineeDetail.bulkCreate(finalNomineeData, { t });
        };

    return customerLoanNomineeDetail;
}