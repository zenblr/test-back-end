module.exports = (sequelize, DataTypes) => {
    const Source = sequelize.define('source', {
        // attributes
        sourceName: {
            type: DataTypes.STRING,
            field: 'source_name',
        },
        sourcePoint: {
            type: DataTypes.STRING,
            field: 'source_point',
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'source',
    });

    return Source;
}