module.exports = (sequelize, DataTypes) => {
    const Logger = sequelize.define('logger', {
        // attributes
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        token: {
            type: DataTypes.TEXT
        },
        createdDate: {
            type: DataTypes.DATE
        },
        expiryDate: {
            type: DataTypes.DATE
        }
    }, {
        // options
        freezeTableName: true,
        tableName: 'loan_logger',
        timestamps: false
    });

    Logger.associate = function (models) {
        Logger.belongsTo(models.user, { foreignKey: 'userId', as: 'singleUser' });
    }

    return Logger;
}