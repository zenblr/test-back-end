module.exports = (sequelize, DataTypes) => {
    const DigitalGoldSilverRate = sequelize.define('digitalGoldSilverRate', {
        gBuy: {
            type: DataTypes.STRING,
            field: 'gold_buy'
        },
        gSell: {
            type: DataTypes.TEXT,
            field: 'gold_sell'
        },
        sBuy: {
            type: DataTypes.STRING,
            field: 'silver_buy'
        },
        sSell: {
            type: DataTypes.TEXT,
            field: 'silver_sell'
        },
        gBuyGst: {
            type: DataTypes.STRING,
            field: 'gold_buy_gst'
        },
        sBuyGst: {
            type: DataTypes.STRING,
            field: 'silver_buy_gst'
        },
        blockId: {
            type: DataTypes.STRING,
            field:'block_id'
        }
    },
        {
            freezeTableName: true,
            tableName: 'digital_gold_silver_rate',
        })
    return DigitalGoldSilverRate;
}