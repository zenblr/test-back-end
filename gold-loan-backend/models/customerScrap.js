module.exports = (sequelize, DataTypes) => {
    const CustomerScrap = sequelize.define('customerScrap', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        scrapUniqueId: {
            type: DataTypes.STRING,
            field: 'scrap_unique_id'
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
        finalScrapAmountAfterMelting: {
            type: DataTypes.FLOAT,
            field: 'final_scrap_amount_after_melting'
        },
        eligibleScrapAmount: {
            type: DataTypes.FLOAT,
            field: 'eligible_scrap_amount'
        },
        customerScrapCurrentStage: {
            type: DataTypes.ENUM,
            field: 'customer_scrap_current_stage',
            values: ['1', '2', '3', '4', '5', '6', '7']
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
        isDisbursed: {
            type: DataTypes.BOOLEAN,
            field: 'is_disbursed',
            defaultValue: false
        },
        disbursementAmount: {
            type: DataTypes.FLOAT,
            field: 'disbursement_amount'
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        appraiserRequestId:{
            type: DataTypes.INTEGER,
            field: 'appraiser_request_id'
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
        CustomerScrap.belongsTo(models.scrapStage, { foreignKey: 'scrapStageId', as: 'scrapStage' });
        CustomerScrap.hasMany(models.customerScrapOrnamentsDetail, { foreignKey: 'scrapId', as: 'scrapOrnamentsDetail' });
        CustomerScrap.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrap.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        CustomerScrap.hasOne(models.customerScrapPersonalDetail, { foreignKey: "scrapId", as: "scrapPersonalDetail" });
        CustomerScrap.hasOne(models.customerScrapBankDetails, { foreignKey: "scrapId", as: "scrapBankDetails" });
        CustomerScrap.hasOne(models.customerAcknowledgement, { foreignKey: "scrapId", as: "customerScrapAcknowledgement" });
        CustomerScrap.hasOne(models.scrapMeltingOrnament, { foreignKey: "scrapId", as: "meltingOrnament" });
        CustomerScrap.hasOne(models.customerScrapDocument, { foreignKey: "scrapId", as: "scrapDocument" });
        CustomerScrap.hasMany(models.customerScrapPackageDetails, { foreignKey: 'scrapId', as: 'scrapPacketDetails' });
        CustomerScrap.hasMany(models.scrapPacket, { foreignKey: 'scrapId', as: 'scrapPacket' });
        CustomerScrap.hasOne(models.customerScrapDisbursement, {foreignKey: 'scrapId', as: 'scrapDisbursement'});
        CustomerScrap.hasOne(models.scrapQuickPay, {foreignKey: 'scrapId', as: 'scrapQuickPay'});
        CustomerScrap.belongsTo(models.appraiserRequest, { foreignKey: 'appraiserRequestId', as: 'appraiserRequest' });
    }

    CustomerScrap.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        //orna
        if (values.scrapOrnamentsDetail) {
            for (let i = 0; i < values.scrapOrnamentsDetail.length; i++) {

                if (values.scrapOrnamentsDetail[i].ornamentImage && values.scrapOrnamentsDetail[i].ornamentImage ) {
                    let data = {};
                    data.path = values.scrapOrnamentsDetail[i].ornamentImage;
                    data.URL = process.env.BASE_URL + values.scrapOrnamentsDetail[i].ornamentImage;
                    values.scrapOrnamentsDetail[i].ornamentImageData = data;
                }

                if (values.scrapOrnamentsDetail[i].ornamentImageWithWeight && values.scrapOrnamentsDetail[i].ornamentImageWithWeight ) {
                    let data = {};
                    data.path = values.scrapOrnamentsDetail[i].ornamentImageWithWeight;
                    data.URL = process.env.BASE_URL + values.scrapOrnamentsDetail[i].ornamentImageWithWeight;
                    values.scrapOrnamentsDetail[i].ornamentImageWithWeightData = data;
                }
                if (values.scrapOrnamentsDetail[i].ornamentImageWithXrfMachineReading && values.scrapOrnamentsDetail[i].ornamentImageWithXrfMachineReading ) {
                    let data = {};
                    data.path = values.scrapOrnamentsDetail[i].ornamentImageWithXrfMachineReading;
                    data.URL = process.env.BASE_URL + values.scrapOrnamentsDetail[i].ornamentImageWithXrfMachineReading;
                    values.scrapOrnamentsDetail[i].ornamentImageWithXrfMachineReadingData = data;
                }
            }
        }

        if(values.meltingOrnament){
            if(values.meltingOrnament.ornamentImageWithWeight){
                let data = {};
                data.path = values.meltingOrnament.ornamentImageWithWeight;
                data.URL = process.env.BASE_URL + values.meltingOrnament.ornamentImageWithWeight;
                values.meltingOrnament.ornamentImageWithWeightData = data;
            }
            if(values.meltingOrnament.ornamentImageWithXrfMachineReading){
                let data = {};
                data.path = values.meltingOrnament.ornamentImageWithXrfMachineReading;
                data.URL = process.env.BASE_URL + values.meltingOrnament.ornamentImageWithXrfMachineReading;
                values.meltingOrnament.ornamentImageWithXrfMachineReadingData = data;
            }
            if(values.meltingOrnament.ornamentImage){
                let data = {};
                data.path = values.meltingOrnament.ornamentImage;
                data.URL = process.env.BASE_URL + values.meltingOrnament.ornamentImage;
                values.meltingOrnament.ornamentImageData = data;
            }
        }
        if (values.scrapBankDetails && values.scrapBankDetails.passbookProof != null) {
            let passbookProof = [];
            for (image of values.scrapBankDetails.passbookProof) {
                image = process.env.BASE_URL + image;
                passbookProof.push(image);
            }
            values.scrapBankDetails.passbookProofImage = passbookProof;
        }
        if (values.customerScrapAcknowledgement && values.customerScrapAcknowledgement.customerConfirmation != null) {
            let customerConfirmationImage = [];
            for (image of values.customerScrapAcknowledgement.customerConfirmation) {
                imageData = process.env.BASE_URL + image;
                customerConfirmationImage.push(imageData);
            }
            values.customerScrapAcknowledgement.customerConfirmationImage = customerConfirmationImage;
        }

        if (values.scrapDocument && values.scrapDocument.purchaseVoucher != null) {
            let purchaseVoucher = [];
            for (image of values.scrapDocument.purchaseVoucher) {
                image = process.env.BASE_URL + image;
                purchaseVoucher.push(image);
            }
            values.scrapDocument.purchaseVoucherImage = purchaseVoucher;
        }
        if (values.scrapDocument && values.scrapDocument.purchaseInvoice != null) {
            let purchaseInvoice = [];
            for (image of values.scrapDocument.purchaseInvoice) {
                image = process.env.BASE_URL + image;
                purchaseInvoice.push(image);
            }
            values.scrapDocument.purchaseInvoiceImage = purchaseInvoice;
        }
        if (values.scrapDocument && values.scrapDocument.saleInvoice != null) {
            let saleInvoice = [];
            for (image of values.scrapDocument.saleInvoice) {
                image = process.env.BASE_URL + image;
                saleInvoice.push(image);
            }
            values.scrapDocument.saleInvoiceImage = saleInvoice;
        }
        if(values.scrapPacketDetails ){
            for(let data of values.scrapPacketDetails){
                if(data.emptyPacketWithRefiningOrnament){
                    let packetData = process.env.BASE_URL + data.emptyPacketWithRefiningOrnament;
                    data.emptyPacketWithNoOrnament = data.emptyPacketWithRefiningOrnament
                    data.emptyPacketWithNoOrnamentImage = packetData;
                }
                if(data.sealedPacketWithWeight){
                    let packetData = process.env.BASE_URL + data.sealedPacketWithWeight;
                    data.sealingPacketWithWeight =  data.sealedPacketWithWeight
                    data.sealingPacketWithWeightImage = packetData;
                }
                if(data.sealedPacketWithCustomer){
                    let packetData = process.env.BASE_URL + data.sealedPacketWithCustomer;
                    data.sealingPacketWithCustomer = data.sealedPacketWithCustomer
                    data.sealingPacketWithCustomerImage = packetData;
                }
            }
            
        }

        return values;
    }

    return CustomerScrap;
}
