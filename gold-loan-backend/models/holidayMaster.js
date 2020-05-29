module.exports = (sequelize, DataTypes) => {
    const HolidayMaster = sequelize.define('holidayMaster', {
        // attributes
        holidayDate: {
            type: DataTypes.DATEONLY,
            field: 'holiday_date',
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            field: 'description',
            allowNull: false,
        },
        year:{
            type:DataTypes.INTEGER,
            field:'year',
            allowNull:false
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        isActive:{
            type:DataTypes.BOOLEAN,
            field:'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'holiday_master',
    });


    HolidayMaster.associate = function(models) {
        HolidayMaster.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        HolidayMaster.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return HolidayMaster;
}