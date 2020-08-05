module.exports = (sequelize, DataTypes) => {
    const ScrapMeltingOrnament = sequelize.define('scrapMeltingOrnament', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        grossWeight: {
            type: DataTypes.FLOAT,
            field: 'gross_weight'
        },
        netWeight: {
            type: DataTypes.FLOAT,
            field: 'net_weight'
        },
        deductionWeight: {
            type: DataTypes.FLOAT,
            field: 'deduction_weight'
        },
        karat: {
            type: DataTypes.INTEGER,
            field: 'karat'
        },
        purityReading: {
            type: DataTypes.INTEGER,
            field: 'purity_reading'
        },
        ornamentImageWithWeight: {
            type: DataTypes.TEXT,
            field: 'ornament_image_with_weight'
        },
        ornamentImageWithXrfMachineReading: {
            type: DataTypes.TEXT,
            field: 'ornament_image_with_xrf_machine_reading'
        },
        ornamentImage: {
            type: DataTypes.TEXT,
            field: 'ornament_image'
        },
        customerConfirmation: {
            type: DataTypes.ENUM,
            field: 'customer_confirmation',
            values: ['yes', 'no']
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
    }, {
        freezeTableName: true,
        tableName: 'scrap_melting_ornament',
    });


    ScrapMeltingOrnament.associate = function (models) {
        ScrapMeltingOrnament.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'scrap' });

        ScrapMeltingOrnament.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        ScrapMeltingOrnament.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return ScrapMeltingOrnament;
}