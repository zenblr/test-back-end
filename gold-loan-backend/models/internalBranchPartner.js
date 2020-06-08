module.exports = (sequelize, DataTypes) => {
    const InternalBranchPartner = sequelize.define('internalBranchPartner', {
        //attribute
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        },
        partnerId: {
            type: DataTypes.INTEGER,
            field: 'partner_id'
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true

        }
    },
        {
            freezeTableName: true,
            allowNull: false,   
            tableName: 'internal_branch_partner',
        },
    )

    return InternalBranchPartner;

}