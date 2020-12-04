module.exports = (sequelize, DataTypes) => {
    const customerRegister = sequelize.define('customerRegister', {
        firstName: {
            type: DataTypes.STRING,
            field: 'first_name',
            validate: {
                len: {
                    args: [0, 30]
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            field: 'last_name',
            validate: {
                len: {
                    args: [0, 30]
                }
            }
        },
        mobileNumber: {
            type: DataTypes.STRING,
            field: 'mobile_number',
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            field: 'email',
            allowNull: false,
        },
        isFromApp: {
            type: DataTypes.BOOLEAN,
            field: 'is_from_app',
        },
        city: {
            type: DataTypes.STRING,
            field: 'city',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    },
        {
            freezeTableName: true,
            tableName: 'customer_register',
        })


    customerRegister.associate = function (models) {


    }

    return customerRegister
}