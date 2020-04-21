const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('customer', {
        // attributes
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
        password: {
            type: DataTypes.TEXT,
            field: 'password',

        },
        mobileNumber: {
            type: DataTypes.STRING,
            field: 'mobile_number',
            allowNull: false,
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
        panCardNumber: {
            type: DataTypes.STRING,
            field: 'pan_card_number',
        },
        stageId: {
            type: DataTypes.INTEGER,
            field: 'stage_id',
        },
        statusId: {
            type: DataTypes.INTEGER,
            field: 'status_id',
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id',
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
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
        lastLogin: {
            type: DataTypes.DATE,
            field: 'last_login',
        }
    }, {
        freezeTableName: true,
        tableName: 'customer',
    });

    Customer.associate = function (models) {
        Customer.hasMany(models.customerAddress, { foreignKey: 'customerId', as: 'address' });
        Customer.belongsTo(models.stage, { foreignKey: 'stageId', as: 'stage' });
        Customer.belongsTo(models.status, { foreignKey: 'statusId', as: 'status' });
        Customer.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        Customer.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });
        Customer.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        Customer.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    // This hook is always run before create.
    Customer.beforeCreate(function (customer, options, cb) {
        if (customer.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(customer.password, salt, function (err, hash) {
                        if (err) {
                            return err;
                        }
                        customer.password = hash;
                        return resolve(customer, options);
                    });
                });
            });
        }
    });

    // This hook is always run before update.
    Customer.beforeUpdate(function (customer, options, cb) {
        if (customer.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(customer.password, salt, function (err, hash) {
                        if (err) {
                            return err;
                        }
                        customer.password = hash;
                        return resolve(customer, options);
                    });
                });
            });
        }
    });

    // Instance method for comparing password.
    Customer.prototype.comparePassword = function (passw, cb) {
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
    Customer.prototype.toJSON = function () {
        var values = Object.assign({}, this.get());
        delete values.password;
        return values;
    }

    return Customer;
}