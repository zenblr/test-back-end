module.exports = (sequelize, DataTypes) => {
    const CronRun = sequelize.define('cronRun', {
        // attributes
        date: {
            type: DataTypes.DATE,
            field: 'name',
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            field: 'type',
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'cron_run',
        timestamps: false
    });
    return CronRun;
}