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
        Partner.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        Partner.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }


    return Partner;
}