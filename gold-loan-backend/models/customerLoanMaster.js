const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const CustomerLoanMaster = sequelize.define('customerLoanMaster', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        loanTransferId: {
            type: DataTypes.INTEGER,
            field: 'loan_transfer_id'
        },
        masterLoanUniqueId: {
            type: DataTypes.STRING,
            field: 'master_loan_unique_id'
        },
        appraiserRequestId:{
            type: DataTypes.INTEGER,
            field: 'appraiser_request_id'
        },
        parentLoanId: {
            type: DataTypes.INTEGER,
            field: 'parent_loan_id',
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
        loanStatusForAppraiser: {
            type: DataTypes.ENUM,
            field: 'loan_status_for_appraiser',
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
        loanStatusForBM: {
            type: DataTypes.ENUM,
            field: 'loan_status_for_bm',
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
        loanStatusForOperatinalTeam: {
            type: DataTypes.ENUM,
            field: 'loan_status_for_operatinal_team',
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
        totalEligibleAmt: {
            type: DataTypes.DECIMAL(10,2),
            field: 'total_eligible_amt'
        },
        fullAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'full_amount'
        },
        securedLoanAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'secured_loan_amount',
        },
        unsecuredLoanAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'unsecured_loan_amount',
        },
        finalLoanAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'final_loan_amount',
        },
        totalFinalInterestAmt: {
            type: DataTypes.DECIMAL(10,2),
            field: 'total_final_interest_amt'
        },
        outstandingAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'outstanding_amount'
        },
        tenure: {
            type: DataTypes.INTEGER,
            field: 'tenure',
        },
        loanStartDate: {
            type: DataTypes.DATEONLY,
            field: 'loan_start_date'
        },
        loanEndDate: {
            type: DataTypes.DATEONLY,
            field: 'loan_end_date'
        },
        paymentFrequency: {
            type: DataTypes.STRING,
            field: 'payment_frequency'
        },
        processingCharge: {
            type: DataTypes.STRING,
            field: 'processing_charge'
        },
        customerLoanCurrentStage: {
            type: DataTypes.ENUM,
            field: 'customer_loan_current_stage',
            values: ['1', '2', '3', '4', '5', '6']
        },
        loanStageId: {
            type: DataTypes.INTEGER,
            field: 'loan_stage_id'
        },
        isLoanSubmitted: {
            type: DataTypes.BOOLEAN,
            field: 'is_loan_submitted',
            defaultValue: false
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        },
        isLoanTransfer: {
            type: DataTypes.BOOLEAN,
            field: 'is_loan_transfer',
            defaultValue: false
        },
        isUnsecuredSchemeApplied: {
            type: DataTypes.BOOLEAN,
            field: 'is_unsecured_scheme_applied',
            defaultValue: false
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isOrnamentsReleased: {
            type: DataTypes.BOOLEAN,
            field: 'is_ornaments_released',
            defaultValue: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_master'
    })


    CustomerLoanMaster.associate = function (models) {
        CustomerLoanMaster.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        CustomerLoanMaster.belongsTo(models.internalBranch, { foreignKey: 'internalBranchId', as: 'internalBranch' })


        CustomerLoanMaster.hasMany(models.customerLoan, { foreignKey: 'masterLoanId', as: 'customerLoan' });
        CustomerLoanMaster.hasOne(models.customerLoanBankDetail, { foreignKey: 'masterLoanId', as: 'loanBankDetail' });
        CustomerLoanMaster.hasMany(models.customerLoanNomineeDetail, { foreignKey: 'masterLoanId', as: 'loanNomineeDetail' });
        CustomerLoanMaster.hasMany(models.customerLoanOrnamentsDetail, { foreignKey: 'masterLoanId', as: 'loanOrnamentsDetail' });
        CustomerLoanMaster.hasOne(models.customerLoanPersonalDetail, { foreignKey: 'masterLoanId', as: 'loanPersonalDetail' });
        CustomerLoanMaster.hasMany(models.customerLoanPackageDetails, { foreignKey: 'masterLoanId', as: 'loanPacketDetails' });
        CustomerLoanMaster.hasMany(models.packet, { foreignKey: 'masterLoanId', as: 'packet' });
        CustomerLoanMaster.hasMany(models.customerLoanInterest, { foreignKey: 'masterLoanId', as: 'customerLoanInterest' });
        CustomerLoanMaster.hasMany(models.customerLoanDisbursement, { foreignKey: 'masterLoanId', as: 'customerLoanDisbursement' });
        CustomerLoanMaster.hasOne(models.customerLoanDocument, { foreignKey: 'masterLoanId', as: 'customerLoanDocument' });

        CustomerLoanMaster.hasMany(models.customerLoanTransaction, { foreignKey: 'masterLoanId', as: 'customerLoanTransaction' });

        CustomerLoanMaster.belongsTo(models.loanStage, { foreignKey: 'loanStageId', as: 'loanStage' });

        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'bmId', as: 'bm' });
        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'operatinalTeamId', as: 'operatinalTeam' });

        CustomerLoanMaster.belongsTo(models.customerLoanMaster, { foreignKey: 'parentLoanId', as: 'parentLoan' });

        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        CustomerLoanMaster.belongsTo(models.customerLoanTransfer, { foreignKey: 'loanTransferId', as: 'loanTransfer' });
        CustomerLoanMaster.hasMany(models.customerLoanHistory, { foreignKey: 'masterLoanId', as: 'customerLoanHistory' });
        CustomerLoanMaster.hasOne(models.partRelease, { foreignKey: 'masterLoanId', as: 'partRelease' });
        CustomerLoanMaster.hasOne(models.fullRelease, { foreignKey: 'masterLoanId', as: 'fullRelease' });
        CustomerLoanMaster.hasMany(models.customerPacketTracking, { foreignKey: 'masterLoanId', as: 'customerPacketTracking' });

        CustomerLoanMaster.hasMany(models.packetTracking, { foreignKey: 'masterLoanId', as: 'packetTracking' });
        CustomerLoanMaster.hasMany(models.customerTransactionSplitUp, { foreignKey: 'masterLoanId', as: 'transactionSplitUp' });

        CustomerLoanMaster.belongsTo(models.appraiserRequest, { foreignKey: 'appraiserRequestId', as: 'appraiserRequest' });


    }

    CustomerLoanMaster.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        //orna
        var resOrna = []
        if (values.loanOrnamentsDetail) {
            for (let i = 0; i < values.loanOrnamentsDetail.length; i++) {
                if (values.loanOrnamentsDetail[i].weightMachineZeroWeight) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    values.loanOrnamentsDetail[i].weightMachineZeroWeightData = data;

                }

                if (values.loanOrnamentsDetail[i].withOrnamentWeight) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].withOrnamentWeight;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].withOrnamentWeight;
                    values.loanOrnamentsDetail[i].withOrnamentWeightData = data;
                }

                if (values.loanOrnamentsDetail[i].stoneTouch) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].stoneTouch;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].stoneTouch;
                    values.loanOrnamentsDetail[i].stoneTouchData = data;
                }

                if (values.loanOrnamentsDetail[i].acidTest) {
                    // values.loanOrnamentsDetail[i].acidTestData = process.env.BASE_URL + values.loanOrnamentsDetail[i].acidTest;

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].acidTest;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].acidTest;
                    values.loanOrnamentsDetail[i].acidTestData = data;
                }

                if (values.loanOrnamentsDetail[i].ornamentImage) {
                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].ornamentImage;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].ornamentImage;
                    values.loanOrnamentsDetail[i].ornamentImageData = data;
                }
                if (values.loanOrnamentsDetail[i].purityTest) {
                    for (image of values.loanOrnamentsDetail[i].purityTest) {
                        image.purityTest = process.env.BASE_URL + image.purityTest;
                    }

                }
                let purityTestImage = []
                let purityTestPath = []
                let newData;

                if (values.loanOrnamentsDetail[i].purityTest.length) {

                    for (imgUrl of values.loanOrnamentsDetail[i].purityTest) {
                        let URL = process.env.BASE_URL + imgUrl;
                        purityTestImage.push(URL)

                        let path = imgUrl;
                        purityTestPath.push(path)

                        let data = {};
                        data.path = purityTestPath;
                        data.URL = purityTestImage;
                        newData = data;
                    }
                }
                values.loanOrnamentsDetail[i].purityTestImage = newData

                resOrna.push(values.loanOrnamentsDetail[i])
            }
        }
        //add base url in masterLoan loanOrnamentsDetail
        var resMasterOrna = []
        if (values.loanOrnamentsDetail) {
            for (let i = 0; i < values.loanOrnamentsDetail.length; i++) {
                if (values.loanOrnamentsDetail[i].weightMachineZeroWeight) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    values.loanOrnamentsDetail[i].weightMachineZeroWeightData = data;

                }

                if (values.loanOrnamentsDetail[i].withOrnamentWeight) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].withOrnamentWeight;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].withOrnamentWeight;
                    values.loanOrnamentsDetail[i].withOrnamentWeightData = data;
                }

                if (values.loanOrnamentsDetail[i].stoneTouch) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].stoneTouch;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].stoneTouch;
                    values.loanOrnamentsDetail[i].stoneTouchData = data;
                }

                if (values.loanOrnamentsDetail[i].acidTest) {
                    // values.loanOrnamentsDetail[i].acidTestData = process.env.BASE_URL + values.loanOrnamentsDetail[i].acidTest;

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].acidTest;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].acidTest;
                    values.loanOrnamentsDetail[i].acidTestData = data;
                }

                if (values.loanOrnamentsDetail[i].ornamentImage) {
                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].ornamentImage;
                    data.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].ornamentImage;
                    values.loanOrnamentsDetail[i].ornamentImageData = data;
                }
                if (values.loanOrnamentsDetail[i].purityTest) {
                    for (image of values.loanOrnamentsDetail[i].purityTest) {
                        image.purityTest = process.env.BASE_URL + image.purityTest;
                    }

                }
                let purityTestImage = []
                let purityTestPath = []
                let newData;

                if (values.loanOrnamentsDetail[i].purityTest.length) {

                    for (imgUrl of values.loanOrnamentsDetail[i].purityTest) {
                        let URL = process.env.BASE_URL + imgUrl;
                        purityTestImage.push(URL)

                        let path = imgUrl;
                        purityTestPath.push(path)

                        let data = {};
                        data.path = purityTestPath;
                        data.URL = purityTestImage;
                        newData = data;
                    }
                }
                values.loanOrnamentsDetail[i].purityTestImage = newData

                resMasterOrna.push(values.loanOrnamentsDetail[i])
            }
        }

        //bank
        if (values.loanBankDetail) {
            let passbookProofData = [];
            if (values.loanBankDetail.passbookProof) {
                for (image of values.loanBankDetail.passbookProof) {
                    let URL = process.env.BASE_URL + image;
                    passbookProofData.push(URL)

                }
            }
            values.loanBankDetail.passbookProofImage = passbookProofData;
        }
        //add base url in masterLoan loanBankDetail
        if (values.loanBankDetail) {
            let passbookProofData = [];
            if (values.loanBankDetail.passbookProof) {
                for (image of values.loanBankDetail.passbookProof) {
                    let URL = process.env.BASE_URL + image;
                    passbookProofData.push(URL)

                }
            }
            values.loanBankDetail.passbookProofImage = passbookProofData;
        }

        //packet
        var resPac = []
        if (values.loanPacketDetails) {
            for (let i = 0; i < values.loanPacketDetails.length; i++) {

                if (values.loanPacketDetails[i].emptyPacketWithNoOrnament) {
                    values.loanPacketDetails[i].emptyPacketWithNoOrnamentImage = process.env.BASE_URL + values.loanPacketDetails[i].emptyPacketWithNoOrnament;
                }
                if (values.loanPacketDetails[i].sealingPacketWithWeight) {
                    values.loanPacketDetails[i].sealingPacketWithWeightImage = process.env.BASE_URL + values.loanPacketDetails[i].sealingPacketWithWeight;
                }
                if (values.loanPacketDetails[i].sealingPacketWithCustomer) {
                    values.loanPacketDetails[i].sealingPacketWithCustomerImage = process.env.BASE_URL + values.loanPacketDetails[i].sealingPacketWithCustomer;
                }

                resPac.push(values.loanPacketDetails[i])
            }
        }
        //add base url in masterLoan loanPacketDetails
        var resMasterPac = []
        if (values.loanPacketDetails) {
            for (let i = 0; i < values.loanPacketDetails.length; i++) {

                if (values.loanPacketDetails[i].emptyPacketWithNoOrnament) {
                    values.loanPacketDetails[i].emptyPacketWithNoOrnamentImage = process.env.BASE_URL + values.loanPacketDetails[i].emptyPacketWithNoOrnament;
                }
                if (values.loanPacketDetails[i].sealingPacketWithWeight) {
                    values.loanPacketDetails[i].sealingPacketWithWeightImage = process.env.BASE_URL + values.loanPacketDetails[i].sealingPacketWithWeight;
                }
                if (values.loanPacketDetails[i].sealingPacketWithCustomer) {
                    values.loanPacketDetails[i].sealingPacketWithCustomerImage = process.env.BASE_URL + values.loanPacketDetails[i].sealingPacketWithCustomer;
                }

                resMasterPac.push(values.loanPacketDetails[i])
            }
        }

        //documents
        if (values.customerLoanDocument) {
            let loanAgreementCopyImage = []
            let pawnCopyImage = []
            let schemeConfirmationCopyImage = []

            if (values.customerLoanDocument.loanAgreementCopy) {
                for (imgUrl of values.customerLoanDocument.loanAgreementCopy) {
                    let URL = process.env.BASE_URL + imgUrl;
                    loanAgreementCopyImage.push(URL)
                }
            }
            if (values.customerLoanDocument.pawnCopy) {
                for (imgUrl of values.customerLoanDocument.pawnCopy) {
                    let URL = process.env.BASE_URL + imgUrl;
                    pawnCopyImage.push(URL)
                }
            }
            if (values.customerLoanDocument.schemeConfirmationCopy) {
                for (imgUrl of values.customerLoanDocument.schemeConfirmationCopy) {
                    let URL = process.env.BASE_URL + imgUrl;
                    schemeConfirmationCopyImage.push(URL)
                }
            }
            values.customerLoanDocument.loanAgreementCopyImage = loanAgreementCopyImage
            values.customerLoanDocument.pawnCopyImage = pawnCopyImage
            values.customerLoanDocument.schemeConfirmationCopyImage = schemeConfirmationCopyImage

        }
        //add base url in masterLoan customerLoanDocument
        if (values.customerLoanDocument) {
            let loanAgreementCopyImage = []
            let pawnCopyImage = []
            let schemeConfirmationCopyImage = []

            if (values.customerLoanDocument.loanAgreementCopy) {
                for (imgUrl of values.customerLoanDocument.loanAgreementCopy) {
                    let URL = process.env.BASE_URL + imgUrl;
                    loanAgreementCopyImage.push(URL)
                }
            }
            if (values.customerLoanDocument.pawnCopy) {
                for (imgUrl of values.customerLoanDocument.pawnCopy) {
                    let URL = process.env.BASE_URL + imgUrl;
                    pawnCopyImage.push(URL)
                }
            }
            if (values.customerLoanDocument.schemeConfirmationCopy) {
                for (imgUrl of values.customerLoanDocument.schemeConfirmationCopy) {
                    let URL = process.env.BASE_URL + imgUrl;
                    schemeConfirmationCopyImage.push(URL)
                }
            }
            values.customerLoanDocument.loanAgreementCopyImage = loanAgreementCopyImage
            values.customerLoanDocument.pawnCopyImage = pawnCopyImage
            values.customerLoanDocument.schemeConfirmationCopyImage = schemeConfirmationCopyImage

        }




        if (values.loanTransfer) {
            if (values.loanTransfer.pawnTicket) {
                let pawnTicketImage = [];
                for (image of values.loanTransfer.pawnTicket) {
                    let URL = process.env.BASE_URL + image;
                    pawnTicketImage.push(URL)
                }
                values.loanTransfer.pawnTicketImage = pawnTicketImage;
            }
            if (values.loanTransfer.signedCheque) {
                let signedChequeImage = [];
                for (image of values.loanTransfer.signedCheque) {
                    let URL = process.env.BASE_URL + image;
                    signedChequeImage.push(URL)
                }
                values.loanTransfer.signedChequeImage = signedChequeImage;
            }
            if (values.loanTransfer.declaration) {
                let declarationImage = [];
                for (image of values.loanTransfer.declaration) {
                    let URL = process.env.BASE_URL + image;
                    declarationImage.push(URL)
                }
                values.loanTransfer.declarationImage = declarationImage;
            }
        }
        return values
    }

    return CustomerLoanMaster;
}
