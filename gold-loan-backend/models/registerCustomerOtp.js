module.exports = (sequelize, DataTypes) => {
    const RegisterCustomerOtp = sequelize.define('registerCustomerOtp', {
        // attributes
        mobileNumber: {
            type: DataTypes.BIGINT,
            field: 'mobile_number',
            allowNull: false,
        },
        otp: {
            type: DataTypes.INTEGER,
            field: 'otp',
            allowNull: false,
        },
        createdTime: {
            type: DataTypes.DATE,
            field: 'created_time',
        },
        expiryTime :{
            type: DataTypes.DATE,
            field: 'expiry_time',
        },
        referenceCode:{
            type: DataTypes.STRING,
            field: 'reference_code',
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            field: 'is_verified',
            defaultValue: false,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'register_customer_otp',
        timestamps: false
    });

    return RegisterCustomerOtp;
}