module.exports = (sequelize, DataTypes) => {
    const InternalBranch = sequelize.define('internalBranch', {
        internalBranchId: {
            type: DataTypes.STRING,
            field: 'internal_branch_id'
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
        pincode: {
            type: DataTypes.INTEGER,
            field: 'pincode',

        },
        
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    },

        {
            freezeTableName: true,
            tableName: 'loan_internal_branch',
        }

    );

    InternalBranch.associate = function (models) {
        InternalBranch.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        InternalBranch.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });


        InternalBranch.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        InternalBranch.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }
    return InternalBranch;
}