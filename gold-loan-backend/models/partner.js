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

        Partner.belongsToMany(models.scheme, { through: models.partnerScheme });
        Partner.belongsToMany(models.internalBranch, { through: models.internalBranchPartner });
        Partner.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        Partner.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        Partner.hasMany(models.partnerBranch, { foreignKey: 'partnerId', as: 'partnerBranch' });

        Partner.hasMany(models.partnerCommissionHistory, { foreignKey: 'partnerId', as: 'partnerCommissionHistory' });

        Partner.hasMany(models.partnerBranchUser, { foreignKey: 'partnerId', as: 'partnerBranchUser' });
    }


    return Partner;
}