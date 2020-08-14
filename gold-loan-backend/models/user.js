const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        // attributes
        userUniqueId: {
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
        password: {
            type: DataTypes.TEXT,
            field: 'password',
            allowNull: false,
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
        panCardNumber: {
            type: DataTypes.STRING,
            field: 'pan_card_number',
        },
        userTypeId: {
            type: DataTypes.INTEGER,
            field: 'user_type_id',
            allowNull: false,
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
        }
    }, {
        freezeTableName: true,
        tableName: 'user',
    });

    User.associate = function (models) {
        User.hasMany(models.user_address, { foreignKey: 'userId', as: 'address' });
        // User.hasMany(models.userRole, { foreignKey: 'userId', as: 'userRole' });

        User.belongsToMany(models.role, { through: models.userRole });

        User.belongsTo(models.userType, { foreignKey: 'userTypeId', as: 'Usertype' });

        User.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        User.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        User.belongsToMany(models.internalBranch, { through: models.userInternalBranch });
        User.hasMany(models.customerPacketLocation ,{ foreignKey: 'receiverUserId', as: 'customerPacketLocation' })

    }

    // This hook is always run before create.
    User.beforeCreate(function (user, options, cb) {
        if (user.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) {
                            return err;
                        }
                        user.password = hash;
                        return resolve(user, options);
                    });
                });
            });
        }
    });

    // This hook is always run before update.
    User.beforeUpdate(function (user, options, cb) {
        if (user.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) {
                            return err;
                        }
                        user.password = hash;
                        return resolve(user, options);
                    });
                });
            });
        }
    });

    // Instance method for comparing password.
    User.prototype.comparePassword = function (passw, cb) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(passw, this.password, function (err, isMatch) {
                if (err) {
                    return err;
                }
                return resolve(isMatch)
            });
        });
    };

    // This will not return password, refresh token and access token.
    User.prototype.toJSON = function () {
        var values = Object.assign({}, this.get());
        delete values.password;
        return values;
    }

    return User;
}