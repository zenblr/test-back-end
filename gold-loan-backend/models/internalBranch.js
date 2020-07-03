module.exports = (sequelize, DataTypes) => {
    const InternalBranch = sequelize.define('internalBranch', {
        internalBranchUniqueId: {
            type: DataTypes.STRING,
            field: 'internal_branch_unique_id'
        },
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id'
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id'
        },
        address: {
            type: DataTypes.TEXT,
            field: 'address'
        },
        pinCode: {
            type: DataTypes.INTEGER,
            field: 'pin_code',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false,
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false,
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code'
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        bankBranch: {
            type: DataTypes.STRING,
            field: 'bank_branch'
        },
        accountHolderName: {
            type: DataTypes.STRING,
            field: 'account_holder_name'
        },
        accountNumber: {
            type: DataTypes.BIGINT,
            field: 'account_number'
        },
        passbookStatementChequeId: {
            type: DataTypes.INTEGER,
            field: 'passbook_statement_cheque_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
    },

        {
            freezeTableName: true,
            tableName: 'loan_internal_branch',
        }

    );

    InternalBranch.associate = function (models) {
        InternalBranch.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        InternalBranch.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });


        InternalBranch.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        InternalBranch.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        InternalBranch.belongsToMany(models.user, { through: models.userInternalBranch });
        InternalBranch.belongsToMany(models.partner, { through: models.internalBranchPartner })

        InternalBranch.belongsTo(models.fileUpload, { foreignKey: 'passbookStatementChequeId', as: 'passbookStatementCheque' })

    }

    InternalBranch.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.passbookStatementCheque) {
            values.passbookStatementCheque.URL = process.env.BASE_URL + values.passbookStatementCheque.path;
        }
        return values;
    }

    return InternalBranch;
}