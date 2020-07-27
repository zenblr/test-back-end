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
        CustomerScrap.belongsTo(models.scrapStage, { foreignKey: 'scrapStageId', as: 'scrapStage' });
        CustomerScrap.hasMany(models.customerScrapOrnamentsDetail, { foreignKey: 'scrapId', as: 'scrapOrnamentsDetail' });
        CustomerScrap.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrap.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        CustomerScrap.hasOne(models.customerScrapPersonalDetail,{foreignKey : "scrapId", as: "scrapPersonalDetail"});
        CustomerScrap.hasOne(models.customerScrapBankDetails,{foreignKey : "scrapId", as: "scrapBankDetails"});
        CustomerScrap.hasOne(models.customerAcknowledgement,{foreignKey : "scrapId", as: "customerScrapAcknowledgement"});
        CustomerScrap.hasOne(models.customerScrapDocument,{foreignKey : "scrapId", as: "scrapDocument"});
        CustomerScrap.hasMany(models.customerScrapPackageDetails, { foreignKey: 'scrapId', as: 'scrapPacketDetails' });
        CustomerScrap.hasMany(models.scrapPacket, { foreignKey: 'scrapId', as: 'scrapPacket' });
    }

    CustomerScrap.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        //orna
        if (values.scrapOrnamentsDetail) {
            for (let i = 0; i < values.scrapOrnamentsDetail.length; i++) {

                if (values.scrapOrnamentsDetail[i].ornamentImage) {
                    let ornamentImage = [];
                    for (image of values.scrapOrnamentsDetail[i].ornamentImage) {
                        image = process.env.BASE_URL + image;
                        ornamentImage.push(image);
                    }
                    values.scrapOrnamentsDetail[i].ornamentImage = ornamentImage;
                }

                if (values.scrapOrnamentsDetail[i].imageOne) {
                    let imageOne = [];
                    for (image of values.scrapOrnamentsDetail[i].imageOne) {
                        image = process.env.BASE_URL + image;
                        imageOne.push(image);
                    }
                    values.scrapOrnamentsDetail[i].imageOne = imageOne;
                }
                if (values.scrapOrnamentsDetail[i].imageTwo) {
                    let imageTwo = [];
                    for (image of values.scrapOrnamentsDetail[i].imageTwo) {
                        image = process.env.BASE_URL + image;
                        imageTwo.push(image);
                    }
                    values.scrapOrnamentsDetail[i].imageTwo = imageTwo;
                }
                if (values.scrapOrnamentsDetail[i].imageThree) {
                    let imageThree = [];
                    for (image of values.scrapOrnamentsDetail[i].imageThree) {
                        image = process.env.BASE_URL + image;
                        imageThree.push(image);
                    }
                    values.scrapOrnamentsDetail[i].imageThree = imageThree;
                }
            }
        }

        if(values.scrapBankDetails){
            let passbookProof = [];
            for (image of values.scrapBankDetails.passbookProof) {
                image = process.env.BASE_URL + image;
                passbookProof.push(image);
            }
            values.scrapBankDetails.passbookProof = passbookProof;
        }

        if(values.customerScrapAcknowledgement){
            let xrfMachineReading = [];
            for (image of values.customerScrapAcknowledgement.xrfMachineReading) {
                image = process.env.BASE_URL + image;
                xrfMachineReading.push(image);
            }
            values.customerScrapAcknowledgement.xrfMachineReading = xrfMachineReading;
        }
        if(values.customerScrapAcknowledgement){
            let customerConfirmation = [];
            for (image of values.customerScrapAcknowledgement.customerConfirmation) {
                image = process.env.BASE_URL + image;
                customerConfirmation.push(image);
            }
            values.customerScrapAcknowledgement.customerConfirmation = customerConfirmation;
        }

        if(values.scrapDocument){
            let purchaseVoucher = [];
            for (image of values.customerScrapAcknowledgement.purchaseVoucher) {
                image = process.env.BASE_URL + image;
                purchaseVoucher.push(image);
            }
            values.scrapDocument.purchaseVoucher = purchaseVoucher;
        }
        if(values.scrapDocument){
            let purchaseInvoice = [];
            for (image of values.customerScrapAcknowledgement.purchaseInvoice) {
                image = process.env.BASE_URL + image;
                purchaseInvoice.push(image);
            }
            values.scrapDocument.purchaseInvoice = purchaseInvoice;
        }
        if(values.scrapDocument){
            let saleInvoice = [];
            for (image of values.customerScrapAcknowledgement.saleInvoice) {
                image = process.env.BASE_URL + image;
                saleInvoice.push(image);
            }
            values.scrapDocument.saleInvoice = saleInvoice;
        }

        return values;
    }

    return CustomerScrap;
}
