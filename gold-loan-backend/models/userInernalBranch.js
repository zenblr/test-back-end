module.exports = (sequelize, DataTypes) => {
    const UserInternalBranch = sequelize.define('userInternalBranch', {
        // attributes
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'user_internal_branch'
    });
    
    UserInternalBranch.associate = function(models) {
        //  UserInternalBranch.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        //  UserInternalBranch.belongsTo(models.role, { foreignKey: 'roleId', as: 'role' });
    }


    return UserInternalBranch;
}