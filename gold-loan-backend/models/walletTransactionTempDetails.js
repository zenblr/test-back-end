module.exports = (sequelize, DataTypes) => {
    const WalletTransactionTempDetails = sequelize.define('walletTransactionTempDetails', {
        //attribute
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        productTypeId: {
            type: DataTypes.INTEGER,
            field: 'product_type_id'
        },
        orderTypeId: {
            type: DataTypes.INTEGER,
            field: 'order_type_id',
        },
        // tempOrderDetailId: {
        //     type: DataTypes.INTEGER,
        //     field: 'temp_order_detail_id',
        // },
        walletTempId: {
            type: DataTypes.INTEGER,
            field: 'wallet_temp_id',
        },
        transactionUniqueId: {
            type: DataTypes.STRING,
            field: 'transaction_unique_id'
        },
        bankTransactionUniqueId: {
            type: DataTypes.STRING,
            field: 'bank_transaction_unique_id'
        },
        razorPayTransactionId: {
            type: DataTypes.STRING,
            field: 'razor_pay_transaction_id'
        },
        paymentType: {
            type: DataTypes.STRING,
            field: 'payment_type',
        },
        transactionAmont: {
            type: DataTypes.DECIMAL(10, 2),
            field: 'transaction_amont'
        },
        paymentReceivedDate: {
            type: DataTypes.DATE,
            field: 'payment_received_date'
        },
        chequeNumber: {
            type: DataTypes.STRING,
            field: 'cheque_number',
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name',
        },
        branchName: {
            type: DataTypes.STRING,
            field: 'branch_name',
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

        isOrderPlaced: {
            type: DataTypes.BOOLEAN,
            field: 'is_order_placed',
            defaultValue: false,
        },
        refundCronExecuted: {
            type: DataTypes.BOOLEAN,
            field: 'refund_cron_executed',
            defaultValue: false,
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'wallet_transaction_temp_details',
        },
    )

    WalletTransactionTempDetails.associate = function (models) {
        // WalletTransactionTempDetails.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });

    }

    WalletTransactionTempDetails.getWalletTempTransactionDetails = (razorPayTransactionId) => WalletTransactionTempDetails.findOne({ where: { razorPayTransactionId } });

    return WalletTransactionTempDetails;

}