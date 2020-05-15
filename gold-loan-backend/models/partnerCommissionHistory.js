module.exports = (sequelize, DataTypes) => {
    const PartnerCommissionHistory = sequelize.define('partnerCommissionHistory', {
        // attributes
        partnerId:{
            type: DataTypes.INTEGER,
            field: 'partner_id',
            allowNull: false
        },
        commission: {
            type: DataTypes.FLOAT,
            field: 'commission'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false
        },
        modifiedTime: {
            type: DataTypes.DATE,
            field: 'modified_time',
            allowNull: false
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'loan_partner_commission_history',
    });


    PartnerCommissionHistory.associate = function(models) {
        PartnerCommissionHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        PartnerCommissionHistory.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
    }

    return PartnerCommissionHistory;
}