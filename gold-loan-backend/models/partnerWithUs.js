module.exports = (sequelize, DataTypes) => {
    const PartnerWithUs = sequelize.define('partnerwithUs', {
        //attribute
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
        email: {
            type: DataTypes.STRING,
            field: 'email',
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
        companyName: {
            type: DataTypes.STRING,
            field: 'company_name',
        },
        message: {
            type: DataTypes.STRING,
            field: 'message',
        },

    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'partner_with_us',
        },
    )

    return PartnerWithUs;

}