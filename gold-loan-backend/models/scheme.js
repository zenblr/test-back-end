module.exports = (sequelize, DataTypes) => {
    const Scheme = sequelize.define('scheme', {
        //attribute
        unsecuredSchemeId: {
            type: DataTypes.INTEGER,
            field: 'unsecured_scheme_id',
        },
        schemeName: {
            type: DataTypes.STRING,
            field: 'scheme_name'
        },
        schemeAmountStart: {
            type: DataTypes.BIGINT,
            field: 'scheme_amount_start'
        },
        schemeAmountEnd: {
            type: DataTypes.BIGINT,
            field: 'scheme_amount_end'
        },
        processingChargeFixed: {
            type: DataTypes.FLOAT,
            field: 'processing_charge_fixed'
        },
        processingChargePercent: {
            type: DataTypes.FLOAT,
            field: 'processing_charge_percent'
        },
        rpg:{
            type: DataTypes.FLOAT,
            field: 'rpg',
            allowNull: false
        },
        penalInterest: {
            type: DataTypes.FLOAT,
            field: 'penal_interest'
        },
        schemeType: {
            type: DataTypes.ENUM,
            field: 'scheme_type',
            values: ['secured', 'unsecured'],
            allowNull: false,
        },
        isTopup: {
            type: DataTypes.BOOLEAN,
            field: 'is_topup',
            defaultValue: true
        },
        isSplitAtBeginning: {
            type: DataTypes.BOOLEAN,
            field: 'is_split_at_beginning',
            defaultValue: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'loan_scheme',
        },
    )
    Scheme.associate = function (models) {

        Scheme.belongsToMany(models.partner, { through: models.partnerScheme });

        Scheme.belongsTo(models.scheme, { foreignKey: 'unsecuredSchemeId', as: 'unsecuredScheme' })

        Scheme.hasMany(models.schemeInterest, { foreignKey: 'schemeId', as: 'schemeInterest' })

        Scheme.belongsToMany(models.internalBranch, { through: models.schemeInternalBranch, foreignKey: 'schemeId' })

    }
    return Scheme;

}
