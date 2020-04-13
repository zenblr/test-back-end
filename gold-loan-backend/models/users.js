const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('users', {
        // attributes
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
            type: DataTypes.BIGINT,
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
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        },
        lastLogin: {
            type: DataTypes.DATE,
            field: 'last_login',
        }
    }, {
        freezeTableName: true,
        tableName: 'users',
    });

    User.associate = function(models) {
        User.hasMany(models.user_address, { foreignKey: 'userId', as: 'address' });
        // User.hasMany(models.userRole, { foreignKey: 'userId', as: 'userRole' });

        User.belongsToMany(models.roles, {through: models.userRole})
    }

    // This hook is always run before create.
    User.beforeCreate(function(user, options, cb) {
        if (user.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(user.password, salt, function(err, hash) {
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
    User.beforeUpdate(function(user, options, cb) {
        if (user.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(user.password, salt, function(err, hash) {
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
    User.prototype.comparePassword = function(passw, cb) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(passw, this.password, function(err, isMatch) {
                if (err) {
                    return err;
                }
                return resolve(isMatch)
            });
        });
    };

    // This will not return password, refresh token and access token.
    User.prototype.toJSON = function() {
        var values = Object.assign({}, this.get());
        delete values.password;
        return values;
    }

    return User;
}