module.exports = (sequelize, DataTypes) =>{
    const NewCity = sequelize.define('newCity', {
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id',
        },
        cityName: {
            type: DataTypes.STRING,
            field: 'city_name',
        },
        cityUniqueId: {
            type: DataTypes.STRING,
            field: 'city_unique_id',
            defaultValue:null
        },
        
    },{
        freezeTableName: true,
        tableName:"new_city"
    })

    return NewCity
}