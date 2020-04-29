module.exports = (sequelize, DataTypes) => {
    const Partner = sequelize.define('partner', {
        partnerId: {
            type: DataTypes.STRING,
            field: 'partner_id'
        },
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        commission: {
            type: DataTypes.FLOAT,
            field: 'commission'
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,

        }
    },
        {
            freezeTableName: true,
            tableName: 'loan_partner',
        }
    );


    Partner.associate = function (models) {

        Partner.belongsToMany(models.scheme, { through: models.partnerScheme })
    }


    return Partner;
}