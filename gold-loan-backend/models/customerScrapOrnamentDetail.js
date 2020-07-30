module.exports = (sequelize, DataTypes) => {
    const CustomerScrapOrnamentsDetail = sequelize.define('customerScrapOrnamentsDetail', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        ornamentTypeId: {
            type: DataTypes.INTEGER,
            field: 'ornament_type_id'
        },
        quantity: {
            type: DataTypes.INTEGER,
            field: 'quantity'
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
        approxPurityReading: {
            type: DataTypes.INTEGER,
            field: 'approx_purity_reading'
        },
        ornamentImage: {
            type: DataTypes.TEXT,
            field: 'ornament_image'
        },
        ornamentImageWithWeight: {
            type: DataTypes.TEXT,
            field: 'ornament_image_with_weight'
        },
        ornamentImageWithXrfMachineReading: {
            type: DataTypes.TEXT,
            field: 'ornament_image_with_xrf_machine_reading'
        },
        ltvAmount: {
            type: DataTypes.FLOAT,
            field: 'ltv_amount'
        },
        scrapAmount: {
            type: DataTypes.FLOAT,
            field: 'scrap_amount'
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
        tableName: 'scrap_customer_scrap_ornaments_detail',
    });


    CustomerScrapOrnamentsDetail.associate = function (models) {
        CustomerScrapOrnamentsDetail.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'scrap' });

        CustomerScrapOrnamentsDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrapOrnamentsDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        CustomerScrapOrnamentsDetail.belongsTo(models.ornamentType, { foreignKey: 'ornamentTypeId', as: 'ornamentType' });

    }

    return CustomerScrapOrnamentsDetail;
}