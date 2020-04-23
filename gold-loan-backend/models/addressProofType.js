module.exports = (sequelize, DataTypes) => {
    const AddressProofType = sequelize.define('addressProofType', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'address_proof_type',
        timestamps: false
    });


    return AddressProofType;
}