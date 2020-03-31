const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('customers', {
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
        address: {
            type: DataTypes.TEXT,
            field: 'address',
            allowNull: false,
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
        postalCode: {
            type: DataTypes.INTEGER,
            field: 'postal_code'
        },
        ratingId: {
            type: DataTypes.INTEGER,
            field: 'rating_id',
            allowNull: false,
        },
        stageId: {
            type: DataTypes.INTEGER,
            field: 'stage_id',
            allowNull: false,
        },
        statusId: {
            type: DataTypes.INTEGER,
            field: 'status_id',
            allowNull: false,
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
        }
    }, {
        freezeTableName: true,
        tableName: 'customers',
    });

    Customer.associate = function(models) {
        Customer.belongsTo(models.rating, { foreignKey: 'ratingId', as: 'rating' });
        Customer.belongsTo(models.stage, { foreignKey: 'stageId', as: 'stage' });
        Customer.belongsTo(models.status, { foreignKey: 'statusId', as: 'status' });
        Customer.belongsTo(models.states, { foreignKey: 'stateId', as: 'state' });
        Customer.belongsTo(models.cities, { foreignKey: 'cityId', as: 'city' });
        Customer.belongsTo(models.users, { foreignKey: 'createdBy', as: 'Createdby' });
        Customer.belongsTo(models.users, { foreignKey: 'modifiedBy', as: 'modifiedby' });
    }

    // This hook is always run before create.
    Customer.beforeCreate(function(customer, options, cb) {
        if (customer.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(customer.password, salt, function(err, hash) {
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
    Customer.beforeUpdate(function(customer, options, cb) {
        if (customer.password) {
            return new Promise((resolve, reject) => {
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        return err;
                    }
                    bcrypt.hash(customer.password, salt, function(err, hash) {
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
    Customer.prototype.comparePassword = function(passw, cb) {
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
    Customer.prototype.toJSON = function() {
        var values = Object.assign({}, this.get());
        delete values.password;
        delete values.otp;
        return values;
    }

    return Customer;
}