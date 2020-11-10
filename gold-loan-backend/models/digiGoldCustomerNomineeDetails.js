module.exports = (sequelize, DataTypes) => {
    const DigiGoldCustomerNomineeDetails = sequelize.define('digiGoldCustomerNomineeDetails', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        nomineeName: {
            type: DataTypes.STRING,
            field: 'nominee_name',
        },
        nomineeDob: {
            type: DataTypes.DATEONLY,
            field: 'nominee_dob'
        },
        nomineeRelation: {
            type: DataTypes.STRING,
            field: 'nominee_relation'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'digi_gold_customer_nominee_details',
    });

    DigiGoldCustomerNomineeDetails.associate = function (models) {
        DigiGoldCustomerNomineeDetails.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }

    return DigiGoldCustomerNomineeDetails;
}