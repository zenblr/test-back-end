module.exports = (sequelize, DataTypes) => {
    const customerBankDetail = sequelize.define('customerBankDetails', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        moduleId: {
            type: DataTypes.INTEGER,
            field: 'module_id',
        },
        description: {
            type: DataTypes.TEXT,
            field: 'description'
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        bankId: {
            type: DataTypes.STRING,
            field: 'bank_id'
        },
        bankBranchName: {
            type: DataTypes.STRING,
            field: 'bank_branch_name'
        },
        accountType: {
            type: DataTypes.STRING,
            field: 'account_type',
        },
        accountHolderName: {
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
        userBankId: {
            type: DataTypes.STRING,
            field: 'user_bank_id'
        },
        passbookProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'passbook_proof'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_bank_details',
    });


    customerBankDetail.associate = function (models) {
        customerBankDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

    }

    customerBankDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));

        let passbookProofImage = []
        if (values.passbookProof) {
            for (imgUrl of values.passbookProof) {
                let URL = process.env.BASE_URL + imgUrl;
                passbookProofImage.push(URL)
            }
        }
        values.passbookProofImage = passbookProofImage

        return values;
    }


    return customerBankDetail;
}