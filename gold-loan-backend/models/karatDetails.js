module.exports = (sequelize, DataTypes) => {
    const KaratDetails = sequelize.define('karatDetails', {
        // attributes
        karat: {
            type: DataTypes.INTEGER,
            field: 'karat',
            allowNull: false,
        },
        deductionBasedOnPurity:{
            type: DataTypes.STRING,
            field:'deduction_based_on_purity'
        },
        percentage:{
            type: DataTypes.STRING,
            field:'percentage'
        },
        createdBy:{
            type:DataTypes.INTEGER,
            field:'created_by'
        },
        modifiedBy:{
            type: DataTypes.INTEGER,
            field:'modified_by'
        },
        isActive:{
            type:DataTypes.BOOLEAN,
            field:'is_active'
        }
    },
       {
        freezeTableName: true,
        allowNull: false,
        tableName: 'karat_details',
    });
    return KaratDetails;
}