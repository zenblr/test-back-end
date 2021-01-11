module.exports = (sequelize, DataTypes) => {

    const DigiGoldAugmontBankDetails = sequelize.define('digiGoldAugmontBankDetails', {
        // attributes
        nameOfBeneficiary: {
            type: DataTypes.STRING,
            field: 'name_of_beneficiary',
        },
        BankName: {
            type: DataTypes.STRING,
            field: 'name_of_beneficiary_bank',
        },
        BranchName: {
            type: DataTypes.STRING,
            field: 'name_of_beneficiary_branch',
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code',
        },
        accountType: {
            type: DataTypes.STRING,
            field: 'account_type',
        },
        accountNumber: {
            type: DataTypes.STRING,
            field: 'account_Number',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_augmont_bank_detail',
    });




    return DigiGoldAugmontBankDetails;
}