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
        schemeId: {
            type: DataTypes.INTEGER,
            field: 'scheme_id'
        },
        unsecuredSchemeId: {
            type: DataTypes.INTEGER,
            field: 'unsecured_scheme_id'
        },
        interestRate: {
            type: DataTypes.STRING,
            field: 'interest_rate'
        },
        unsecuredInterestRate: {
            type: DataTypes.STRING,
            field: 'unsecured_interest_rate'
        },
        loanType: {
            type: DataTypes.STRING,
            field: 'loan_type'
        },
        unsecuredLoanId: {
            type: DataTypes.INTEGER,
            field: 'unsecured_loan_id'
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
        customerLoan.belongsTo(models.scheme, { foreignKey: 'unsecuredSchemeId', as: 'unsecuredScheme' });

        customerLoan.belongsTo(models.customerLoan, { foreignKey: 'unsecuredLoanId', as: 'unsecuredLoan' });

        customerLoan.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoan.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });


    }

    customerLoan.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));

        var resOrna = []
        for (let i = 0; i < values.loanOrnamentsDetail.length; i++) {
            if (values.loanOrnamentsDetail[i].weightMachineZeroWeightData) {
                values.loanOrnamentsDetail[i].weightMachineZeroWeightData.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].weightMachineZeroWeightData.path;
            }
            if (values.loanOrnamentsDetail[i].withOrnamentWeightData) {
                values.loanOrnamentsDetail[i].withOrnamentWeightData.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].withOrnamentWeightData.path;
            }
            if (values.loanOrnamentsDetail[i].stoneTouchData) {
                values.loanOrnamentsDetail[i].stoneTouchData.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].stoneTouchData.path;
            }
            if (values.loanOrnamentsDetail[i].acidTestData) {
                values.loanOrnamentsDetail[i].acidTestData.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].acidTestData.path;
            }
            if (values.loanOrnamentsDetail[i].ornamentImageData) {
                values.loanOrnamentsDetail[i].ornamentImageData.URL = baseUrlConfig.BASEURL + values.loanOrnamentsDetail[i].ornamentImageData.path;
            }
            if (values.loanOrnamentsDetail[i].purityTestImage) {
                for (image of values.loanOrnamentsDetail[i].purityTestImage) {
                    image.purityTest.URL = baseUrlConfig.BASEURL + image.purityTest.path;
                }
            }
            resOrna.push(values.loanOrnamentsDetail[i])
        }

        if (values.loanBankDetail) {
            for (image of values.loanBankDetail.passbookProofImage) {
                image.passbookProof.URL = baseUrlConfig.BASEURL + image.passbookProof.path;
            }
        }

        resPac = []
        for (let i = 0; i < values.loanPacketDetails.length; i++) {

            if (values.loanPacketDetails[i].emptyPacketWithNoOrnament) {
                values.loanPacketDetails[i].emptyPacketWithNoOrnamentImage = baseUrlConfig.BASEURL + values.loanPacketDetails[i].emptyPacketWithNoOrnament;
            }
            if (values.loanPacketDetails[i].packetWithAllOrnaments) {
                values.loanPacketDetails[i].packetWithAllOrnamentsImage = baseUrlConfig.BASEURL + values.loanPacketDetails[i].packetWithAllOrnaments;
            }
            if (values.loanPacketDetails[i].packetWithSealing) {
                values.loanPacketDetails[i].packetWithSealingImage = baseUrlConfig.BASEURL + values.loanPacketDetails[i].packetWithSealing;
            }
            if (values.loanPacketDetails[i].packetWithWeight) {
                values.loanPacketDetails[i].packetWithWeightImage = baseUrlConfig.BASEURL + values.loanPacketDetails[i].packetWithWeight;
            }
            resPac.push(values.loanPacketDetails[i])
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
            if (values.customerLoanDocument.schemeConfirmationCopyImage) {
                for (imgUrl of values.customerLoanDocument.pawnCopyImage) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    pawnCopyImage.push(URL)
                }
            }
            if (values.customerLoanDocument.schemeConfirmationCopyImage) {
                for (imgUrl of values.customerLoanDocument.schemeConfirmationCopyImage) {
                    let URL = baseUrlConfig.BASEURL + imgUrl;
                    schemeConfirmationCopyImage.push(URL)
                }
            }
            values.customerLoanDocument.loanAgreementCopyImage = loanAgreementCopyImage
            values.customerLoanDocument.pawnCopyImage = pawnCopyImage
            values.customerLoanDocument.schemeConfirmationCopyImage = schemeConfirmationCopyImage

        }

        values.loanOrnamentsDetail = resOrna
        values.loanPacketDetails = resPac

        return values;
    }

    // FUNCTION TO GET LOAN DETAIL BY ID
    customerLoan.getLoanDetailById =
        (id) => customerLoan.findOne({ where: { id, isActive: true } });

    return customerLoan;
}