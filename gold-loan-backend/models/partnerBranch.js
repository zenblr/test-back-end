module.exports = (sequelize, DataTypes) => {
    const PartnerBranch = sequelize.define('partnerBranch', {
        partnerId: {
            type: DataTypes.INTEGER,
            field: 'partner_id'
        },
        branchId: {
            type: DataTypes.STRING,
            field: 'branch_id'
        },
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id'
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id'
        },
        address: {
            type: DataTypes.TEXT,
            field: 'address'
        },

        pincode: {
            type: DataTypes.INTEGER,
            field: 'pincode',

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
            defaultValue: true
        }
    },

        {
            freezeTableName: true,
            tableName: 'loan_partner_branch',
        }

    );

    PartnerBranch.associate = function (models) {
        PartnerBranch.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
        PartnerBranch.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        PartnerBranch.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });

        PartnerBranch.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        PartnerBranch.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }
    return PartnerBranch;
}