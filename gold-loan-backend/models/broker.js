module.exports = (sequelize, DataTypes) => {
    const Broker = sequelize.define('broker', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        merchantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'merchant_id'
        },
        storeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'store_id'
        },
        nameOnPanCard: {
            type: DataTypes.STRING,
            field:'name_on_pan_card'
        },
        panCard: {
            type: DataTypes.INTEGER,
            field:'pan_card'
        },
        ifscCode: {
            type: DataTypes.STRING,
            field:'ifsc_code'
        },
        bankName: {
            type: DataTypes.STRING,
            field:'bank_name'
        },
        bankBranch: {
            type: DataTypes.STRING,
            field:'bank_branch'
        },
        accountHolderName: {
            type: DataTypes.STRING,
            field:'account_holder_name'
        },
        accountNumber: {
            type: DataTypes.BIGINT,
            field:'account_number'
        },
        passbookStatementCheque: {
            type: DataTypes.INTEGER,
            field:'passbook_statement_cheque'
        },
        isActive:{
            type:DataTypes.BOOLEAN,
            defaultValue:true,
            field:'is_active'
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'status'
        },
        approvalStatusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'approval_status_id'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'created_by'
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'updated_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        freezeTableName: true,
        tableName: 'emi_broker'
    });

    Broker.associate = function (models) {
        Broker.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        Broker.belongsTo(models.user, { foreignKey: 'createdBy', as: 'createdByUser' });
        Broker.belongsTo(models.user, { foreignKey: 'updatedBy', as: 'updatedByUser' });
        Broker.belongsTo(models.merchant, { foreignKey: 'merchantId', as: 'merchant' });
    }



    return Broker;
}