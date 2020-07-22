module.exports = (sequelize, DataTypes) => {
    const CustomerScrap = sequelize.define('customerScrap', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        scrapUniqieId: {
            type: DataTypes.STRING,
            field: 'scrap_uniqie_id'
        },
        applicationFormForAppraiser: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_appraiser',
            defaultValue: false
        },
        goldValuationForAppraiser: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_appraiser',
            defaultValue: false
        },
        scrapStatusForAppraiser: {
            type: DataTypes.ENUM,
            field: 'scrap_status_for_appraiser',
            values: ['approved', 'pending', 'rejected'],
        },
        commentByAppraiser: {
            type: DataTypes.TEXT,
            field: 'comment_by_appraiser'
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id'
        },
        applicationFormForBM: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_bm',
            defaultValue: false
        },
        goldValuationForBM: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_bm',
            defaultValue: false
        },
        scrapStatusForBM: {
            type: DataTypes.ENUM,
            field: 'scrap_status_for_bm',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: 'pending'
        },
        commentByBM: {
            type: DataTypes.TEXT,
            field: 'comment_by_bm'
        },
        bmId: {
            type: DataTypes.INTEGER,
            field: 'bm_id'
        },
        applicationFormForOperatinalTeam: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_operatinal_team',
            defaultValue: false
        },
        goldValuationForOperatinalTeam: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_operatinal_team',
            defaultValue: false
        },
        scrapStatusForOperatinalTeam: {
            type: DataTypes.ENUM,
            field: 'scrap_status_for_operatinal_team',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: 'pending'
        },
        commentByOperatinalTeam: {
            type: DataTypes.TEXT,
            field: 'comment_by_operatinal_team'
        },
        operatinalTeamId: {
            type: DataTypes.INTEGER,
            field: 'operatinal_team_id'
        },
        finalScrapAmount: {
            type: DataTypes.FLOAT,
            field: 'final_scrap_amount'
        },
        customerScrapCurrentStage: {
            type: DataTypes.ENUM,
            field: 'customer_scrap_current_stage',
            values: ['1', '2', '3', '4', '5', '6','7']
        },
        scrapStageId: {
            type: DataTypes.INTEGER,
            field: 'scrap_stage_id'
        },
        isScrapSubmitted: {
            type: DataTypes.BOOLEAN,
            field: 'is_scrap_submitted',
            defaultValue: false
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
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
        tableName: 'scrap_customer_scrap'
    })

    CustomerScrap.associate = function (models) {
        CustomerScrap.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        CustomerScrap.belongsTo(models.internalBranch, { foreignKey: 'internalBranchId', as: 'internalBranch' })
        CustomerScrap.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        CustomerScrap.belongsTo(models.user, { foreignKey: 'bmId', as: 'bm' });
        CustomerScrap.belongsTo(models.user, { foreignKey: 'operatinalTeamId', as: 'operatinalTeam' });
        CustomerScrap.belongsTo(models.customerScrapCurrentStage, { foreignKey: 'scrapStageId', as: 'scrapStage' });

        CustomerScrap.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrap.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerScrap;
}
