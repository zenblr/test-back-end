module.exports = (sequelize, DataTypes) => {
    const KaratDetails = sequelize.define('karatDetails', {
        // attributes
        karat: {
            type: DataTypes.INTEGER,
            field: 'karat',
            allowNull: false,
        },
        fromPercentage: {
            type: DataTypes.FLOAT,
            field: 'from_percentage',
            allowNull: false,
        },
        toPercentage: {
            type: DataTypes.FLOAT,
            field: 'to_percentage',
            allowNull: false
        },
        range: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            field: 'range',
        },
        hm: {
            type: DataTypes.BOOLEAN,
            field: 'hm',
            defaultValue: false
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
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
            tableName: 'karat_details',
        });
    KaratDetails.associate = function (models) {

        KaratDetails.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        KaratDetails.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }
    return KaratDetails;
}