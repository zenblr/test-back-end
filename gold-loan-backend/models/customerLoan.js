const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const customerLoan = sequelize.define('customerLoan', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        loanUniqueId: {
            type: DataTypes.STRING,
            field: 'loan_unique_id'
        },
        partnerId: {
            type: DataTypes.INTEGER,
            field: 'partner_id'
        },
        loanAmount: {
            type: DataTypes.STRING,
            field: 'loan_amount'
        },
        schemeId: {
            type: DataTypes.INTEGER,
            field: 'scheme_id'
        },
        interestRate: {
            type: DataTypes.STRING,
            field: 'interest_rate'
        },
        loanType: {
            type: DataTypes.STRING,
            field: 'loan_type'
        },
        unsecuredLoanId: {
            type: DataTypes.INTEGER,
            field: 'unsecured_loan_id'
        },
        disbursed: {
            type: DataTypes.BOOLEAN,
            field: 'disbursed',
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
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan',
    });

    // CUSTOMER LOAN ASSOCIATION WITH MODULES
    customerLoan.associate = function (models) {
        customerLoan.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        customerLoan.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });


        customerLoan.hasOne(models.customerLoanBankDetail, { foreignKey: 'loanId', as: 'loanBankDetail' });
        customerLoan.hasMany(models.customerLoanNomineeDetail, { foreignKey: 'loanId', as: 'loanNomineeDetail' });
        customerLoan.hasMany(models.customerLoanOrnamentsDetail, { foreignKey: 'loanId', as: 'loanOrnamentsDetail' });
        customerLoan.hasOne(models.customerLoanPersonalDetail, { foreignKey: 'loanId', as: 'loanPersonalDetail' });
        customerLoan.hasMany(models.customerLoanPackageDetails, { foreignKey: 'loanId', as: 'loanPacketDetails' });
        customerLoan.hasMany(models.packet, { foreignKey: 'loanId', as: 'packet' });
        customerLoan.hasMany(models.customerLoanInterest, { foreignKey: 'loanId', as: 'customerLoanInterest' });
        customerLoan.hasMany(models.customerLoanDisbursement, { foreignKey: 'loanId', as: 'customerLoanDisbursement' });
        customerLoan.hasOne(models.customerLoanDocument, { foreignKey: 'loanId', as: 'customerLoanDocument' });

        // customerLoan.belongsTo(models.loanStage, { foreignKey: 'loanStageId', as: 'loanStage' });

        customerLoan.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
        customerLoan.belongsTo(models.scheme, { foreignKey: 'schemeId', as: 'scheme' });
        // customerLoan.belongsTo(models.scheme, { foreignKey: 'unsecuredSchemeId', as: 'unsecuredScheme' });

        customerLoan.belongsTo(models.customerLoan, { foreignKey: 'unsecuredLoanId', as: 'unsecuredLoan' });

        customerLoan.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoan.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });


    }

    customerLoan.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        //orna
        var resOrna = []
        if (values.loanOrnamentsDetail) {
            for (let i = 0; i < values.loanOrnamentsDetail.length; i++) {
                if (values.loanOrnamentsDetail[i].weightMachineZeroWeight) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    data.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    values.loanOrnamentsDetail[i].weightMachineZeroWeightData = data;

                }

                if (values.loanOrnamentsDetail[i].withOrnamentWeight) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].withOrnamentWeight;
                    data.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].withOrnamentWeight;
                    values.loanOrnamentsDetail[i].withOrnamentWeightData = data;
                }

                if (values.loanOrnamentsDetail[i].stoneTouch) {

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].stoneTouch;
                    data.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].stoneTouch;
                    values.loanOrnamentsDetail[i].stoneTouchData = data;
                }

                if (values.loanOrnamentsDetail[i].acidTest) {
                    // values.loanOrnamentsDetail[i].acidTestData = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].acidTest;

                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].acidTest;
                    data.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].acidTest;
                    values.loanOrnamentsDetail[i].acidTestData = data;
                }

                if (values.loanOrnamentsDetail[i].ornamentImage) {
                    let data = {};
                    data.path = values.loanOrnamentsDetail[i].ornamentImage;
                    data.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].ornamentImage;
                    values.loanOrnamentsDetail[i].ornamentImageData = data;
                }
                if (values.loanOrnamentsDetail[i].purityTest) {
                    for (image of values.loanOrnamentsDetail[i].purityTest) {
                        image.purityTest = baseUrlConfig.BASEURL + image.purityTest;
                    }

                }
                let purityTestImage = []
                let purityTestPath = []
                let newData;

                if (values.loanOrnamentsDetail[i].purityTest.length) {

                    for (imgUrl of values.loanOrnamentsDetail[i].purityTest) {
                        let URL = baseUrlConfig.BASEURL + imgUrl;
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
        if (values.masterLoan.loanOrnamentsDetail) {
            for (let i = 0; i < values.masterLoan.loanOrnamentsDetail.length; i++) {
                if (values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeight) {

                    let data = {};
                    data.path = values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    data.URL = baseUrlConfig.BASEURL + values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeight;
                    values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeightData = data;

                }

                if (values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeight) {

                    let data = {};
                    data.path = values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeight;
                    data.URL = baseUrlConfig.BASEURL + values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeight;
                    values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeightData = data;
                }

                if (values.masterLoan.loanOrnamentsDetail[i].stoneTouch) {

                    let data = {};
                    data.path = values.masterLoan.loanOrnamentsDetail[i].stoneTouch;
                    data.URL = baseUrlConfig.BASEURL + values.masterLoan.loanOrnamentsDetail[i].stoneTouch;
                    values.masterLoan.loanOrnamentsDetail[i].stoneTouchData = data;
                }

                if (values.masterLoan.loanOrnamentsDetail[i].acidTest) {
                    // values.masterLoan.loanOrnamentsDetail[i].acidTestData = baseUrlConfig.BASEURL + values.masterLoan.loanOrnamentsDetail[i].acidTest;

                    let data = {};
                    data.path = values.masterLoan.loanOrnamentsDetail[i].acidTest;
                    data.URL = baseUrlConfig.BASEURL + values.masterLoan.loanOrnamentsDetail[i].acidTest;
                    values.masterLoan.loanOrnamentsDetail[i].acidTestData = data;
                }

                if (values.masterLoan.loanOrnamentsDetail[i].ornamentImage) {
                    let data = {};
                    data.path = values.masterLoan.loanOrnamentsDetail[i].ornamentImage;
                    data.URL = baseUrlConfig.BASEURL + values.masterLoan.loanOrnamentsDetail[i].ornamentImage;
                    values.masterLoan.loanOrnamentsDetail[i].ornamentImageData = data;
                }
                if (values.masterLoan.loanOrnamentsDetail[i].purityTest) {
                    for (image of values.masterLoan.loanOrnamentsDetail[i].purityTest) {
                        image.purityTest = baseUrlConfig.BASEURL + image.purityTest;
                    }

                }
                let purityTestImage = []
                let purityTestPath = []
                let newData;

                if (values.masterLoan.loanOrnamentsDetail[i].purityTest.length) {

                    for (imgUrl of values.masterLoan.loanOrnamentsDetail[i].purityTest) {
                        let URL = baseUrlConfig.BASEURL + imgUrl;
                        purityTestImage.push(URL)

                        let path = imgUrl;
                        purityTestPath.push(path)

                        let data = {};
                        data.path = purityTestPath;
                        data.URL = purityTestImage;
                        newData = data;
                    }
                }
                values.masterLoan.loanOrnamentsDetail[i].purityTestImage = newData

                resMasterOrna.push(values.masterLoan.loanOrnamentsDetail[i])
            }
        }

        //bank
        if (values.loanBankDetail) {
            let passbookProofData = [];

            for (image of values.loanBankDetail.passbookProof) {
                let URL = baseUrlConfig.BASEURL + image;
                passbookProofData.push(URL)

            }
            values.loanBankDetail.passbookProofImage = passbookProofData;
        }
        //add base url in masterLoan loanBankDetail
        if (values.masterLoan.loanBankDetail) {
            let passbookProofData = [];

            for (image of values.masterLoan.loanBankDetail.passbookProof) {
                let URL = baseUrlConfig.BASEURL + image;
                passbookProofData.push(URL)

            }
            values.masterLoan.loanBankDetail.passbookProofImage = passbookProofData;
        }

        //packet
       var resPac = []
        if (values.loanPacketDetails) {
            for (let i = 0; i < values.loanPacketDetails.length; i++) {

                if (values.loanPacketDetails[i].emptyPacketWithNoOrnament) {
                    values.loanPacketDetails[i].emptyPacketWithNoOrnamentImage = baseUrlConfig.BASEURL + values.loanPacketDetails[i].emptyPacketWithNoOrnament;
                }
                if (values.loanPacketDetails[i].sealingPacketWithWeight) {
                    values.loanPacketDetails[i].sealingPacketWithWeightImage = baseUrlConfig.BASEURL + values.loanPacketDetails[i].sealingPacketWithWeight;
                }
                if (values.loanPacketDetails[i].sealingPacketWithCustomer) {
                    values.loanPacketDetails[i].sealingPacketWithCustomerImage = baseUrlConfig.BASEURL + values.loanPacketDetails[i].sealingPacketWithCustomer;
                }

                resPac.push(values.loanPacketDetails[i])
            }
        }
        //add base url in masterLoan loanPacketDetails
        var resMasterPac = []
        if (values.masterLoan.loanPacketDetails) {
            for (let i = 0; i < values.masterLoan.loanPacketDetails.length; i++) {

                if (values.masterLoan.loanPacketDetails[i].emptyPacketWithNoOrnament) {
                    values.masterLoan.loanPacketDetails[i].emptyPacketWithNoOrnamentImage = baseUrlConfig.BASEURL + values.masterLoan.loanPacketDetails[i].emptyPacketWithNoOrnament;
                }
                if (values.masterLoan.loanPacketDetails[i].sealingPacketWithWeight) {
                    values.masterLoan.loanPacketDetails[i].sealingPacketWithWeightImage = baseUrlConfig.BASEURL + values.masterLoan.loanPacketDetails[i].sealingPacketWithWeight;
                }
                if (values.masterLoan.loanPacketDetails[i].sealingPacketWithCustomer) {
                    values.masterLoan.loanPacketDetails[i].sealingPacketWithCustomerImage = baseUrlConfig.BASEURL + values.masterLoan.loanPacketDetails[i].sealingPacketWithCustomer;
                }

                resMasterPac.push(values.masterLoan.loanPacketDetails[i])
            }
        }

        //documents
        if (values.customerLoanDocument) {
            let loanAgreementCopyImage = []
            let pawnCopyImage = []
            let schemeConfirmationCopyImage = []

            if (values.customerLoanDocument.loanAgreementCopy) {
                for (imgUrl of values.customerLoanDocument.loanAgreementCopy) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    loanAgreementCopyImage.push(URL)
                }
            }
            if (values.customerLoanDocument.pawnCopy) {
                for (imgUrl of values.customerLoanDocument.pawnCopy) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    pawnCopyImage.push(URL)
                }
            }
            if (values.customerLoanDocument.schemeConfirmationCopy) {
                for (imgUrl of values.customerLoanDocument.schemeConfirmationCopy) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    schemeConfirmationCopyImage.push(URL)
                }
            }
            values.customerLoanDocument.loanAgreementCopyImage = loanAgreementCopyImage
            values.customerLoanDocument.pawnCopyImage = pawnCopyImage
            values.customerLoanDocument.schemeConfirmationCopyImage = schemeConfirmationCopyImage

        }
        //add base url in masterLoan customerLoanDocument
        if (values.masterLoan.customerLoanDocument) {
            let loanAgreementCopyImage = []
            let pawnCopyImage = []
            let schemeConfirmationCopyImage = []

            if (values.masterLoan.customerLoanDocument.loanAgreementCopy) {
                for (imgUrl of values.masterLoan.customerLoanDocument.loanAgreementCopy) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    loanAgreementCopyImage.push(URL)
                }
            }
            if (values.masterLoan.customerLoanDocument.pawnCopy) {
                for (imgUrl of values.masterLoan.customerLoanDocument.pawnCopy) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    pawnCopyImage.push(URL)
                }
            }
            if (values.masterLoan.customerLoanDocument.schemeConfirmationCopy) {
                for (imgUrl of values.masterLoan.customerLoanDocument.schemeConfirmationCopy) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    schemeConfirmationCopyImage.push(URL)
                }
            }
            values.masterLoan.customerLoanDocument.loanAgreementCopyImage = loanAgreementCopyImage
            values.masterLoan.customerLoanDocument.pawnCopyImage = pawnCopyImage
            values.masterLoan.customerLoanDocument.schemeConfirmationCopyImage = schemeConfirmationCopyImage

        }

        // loan transfer details
        if (values.masterLoan.loanTransfer) {
            let pawnTicketData = [];
            for (image of values.masterLoan.loanTransfer.pawnTicket) {
                let URL = baseUrlConfig.BASEURL + image;
                pawnTicketData.push(URL)
            }
            values.masterLoan.loanTransfer.pawnTicket = pawnTicketData;
            let signedChequeData = [];
            for (image of values.masterLoan.loanTransfer.signedCheque) {
                let URL = baseUrlConfig.BASEURL + image;
                signedChequeData.push(URL)
            }
            values.masterLoan.loanTransfer.signedCheque = signedChequeData;
            let declarationData = [];
            for (image of values.masterLoan.loanTransfer.declaration) {
                let URL = baseUrlConfig.BASEURL + image;
                declarationData.push(URL)
            }
            values.masterLoan.loanTransfer.declaration = declarationData;

        }
        values.masterLoan.loanOrnamentsDetail = resMasterOrna
        values.masterLoan.loanPacketDetails = resMasterPac

        values.loanOrnamentsDetail = resOrna
        values.loanPacketDetails = resPac

        return values;
    }

    // FUNCTION TO GET LOAN DETAIL BY ID
    customerLoan.getLoanDetailById =
        (id) => customerLoan.findOne({ where: { id, isActive: true } });

    return customerLoan;
}