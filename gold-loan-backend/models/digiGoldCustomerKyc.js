module.exports = (sequelize, DataTypes) => {
    const DigitalGoldCustomerKyc = sequelize.define('digiGoldCustomerKyc', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        panNumber: {
            type: DataTypes.STRING,
            field: 'pan_number'
        },
        panAttachment: {
            type: DataTypes.TEXT,
            field: 'pan_attachment'
        },
        aadharNumber: {
            type: DataTypes.STRING,
            field: 'aadhar_number'
        },
        aadharAttachment: {
            type: DataTypes.TEXT,
            field: 'aadhar_attachment'
        },
        approvedMessageSent:{
            type:DataTypes.BOOLEAN,
            field:'approved_message_sent',
            defaultValue:false
        },
        rejectedMessageSent:{
            type:DataTypes.BOOLEAN,
            field:'rejected_message_sent',
            defaultValue:false
        },
        status: {
            type: DataTypes.STRING,
            field: 'status',
            defaultValue: "pending"
        }

    },
        {
            freezeTableName: true,
            tableName: 'digi_gold_customer_kyc',
        }
    )

    DigitalGoldCustomerKyc.associate = (models) => {
        DigitalGoldCustomerKyc.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customerDetail' });
    }
    
    return DigitalGoldCustomerKyc;
}