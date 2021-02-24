const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
    const AgtplDepositTransfer = sequelize.define('agtplDepositTransfer', {
        fromTime: {
            type: DataTypes.DATE,
            field: 'from_time'
        },
        toTime: {
            type: DataTypes.DATE,
            field: 'to_time'
        },
        whereClause: {
            type: DataTypes.STRING,
            field: 'where_clause'
        }
    }, {
        freezeTableName: true,
        tableName: 'agtpl_deposit_transfer',
    });

    return AgtplDepositTransfer;
}