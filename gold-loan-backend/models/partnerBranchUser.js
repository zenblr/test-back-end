module.exports = (sequelize, DataTypes) => {
    const partnerBranchUser = sequelize.define('partnerBranchUser', {
        // attributes
        partnerId: {
            type: DataTypes.INTEGER,
            field: 'partner_id'
        },
        branchId: {
            type: DataTypes.INTEGER,
            field: 'branch_id'
        },
        partnerBranchUserUniqueId: {
            type: DataTypes.STRING,
            field: 'user_unique_id',
            unique: true
        },
        firstName: {
            type: DataTypes.STRING,
            field: 'first_name',
            allowNull: false,
            validate: {
                len: {
                    args: [0, 30]
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            field: 'last_name',
            allowNull: false,
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
            validate: {
                len: {
                    args: [0, 30]
                }
            }
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id',
            allowNull: false,
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id',
            allowNull: false,
        },
        pinCode: {
            type: DataTypes.INTEGER,
            field: 'pin_code',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
        lastLogin: {
            type: DataTypes.DATE,
            field: 'last_login',
        },

    }, {
        freezeTableName: true,
        tableName: 'partner_branch_user',
    });

    partnerBranchUser.associate = function (models) {
        partnerBranchUser.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });
        partnerBranchUser.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' })
        partnerBranchUser.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
        partnerBranchUser.belongsTo(models.partnerBranch, { foreignKey: 'branchId', as: 'partnerBranch' });
        partnerBranchUser.hasMany(models.customerPacketTracking, { foreignKey: 'partnerSenderId', as: 'packetSender' });
        partnerBranchUser.hasMany(models.customerPacketTracking, { foreignKey: 'partnerReceiverId', as: 'packetReceiver' });
    }

    return partnerBranchUser;

}