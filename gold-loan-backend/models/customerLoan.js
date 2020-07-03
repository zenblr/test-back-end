module.exports = (sequelize, DataTypes) => {
    const customerLoan = sequelize.define('customerLoan', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        loanUniqueId: {
            type: DataTypes.STRING,
            field: 'loan_unique_id'
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
        totalEligibleAmt: {
            type: DataTypes.STRING,
            field: 'total_eligible_amt'
        },
        totalFinalInterestAmt: {
            type: DataTypes.STRING,
            field: 'total_final_interest_amt'
        },
        finalLoanAmount: {
            type: DataTypes.STRING,
            field: 'final_loan_amount',
        },
        securedLoanAmount: {
            type: DataTypes.STRING,
            field: 'secured_loan_amount',
        },
        unsecuredLoanAmount: {
            type: DataTypes.STRING,
            field: 'unsecured_loan_amount',
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

        customerLoan.hasOne(models.customerLoanBankDetail, { foreignKey: 'loanId', as: 'loanBankDetail' });
        customerLoan.hasMany(models.customerLoanNomineeDetail, { foreignKey: 'loanId', as: 'loanNomineeDetail' });
        customerLoan.hasMany(models.customerLoanOrnamentsDetail, { foreignKey: 'loanId', as: 'loanOrnamentsDetail' });
        customerLoan.hasOne(models.customerLoanPersonalDetail, { foreignKey: 'loanId', as: 'loanPersonalDetail' });
        customerLoan.hasMany(models.customerLoanPackageDetails, { foreignKey: 'loanId', as: 'loanPacketDetails' });
        customerLoan.hasMany(models.packet, { foreignKey: 'loanId', as: 'packet' });

        customerLoan.belongsTo(models.loanStage, { foreignKey: 'loanStageId', as: 'loanStage' });

        customerLoan.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
        customerLoan.belongsTo(models.scheme, { foreignKey: 'schemeId', as: 'scheme' });
        customerLoan.belongsTo(models.scheme, { foreignKey: 'unsecuredSchemeId', as: 'unsecuredScheme' });

        customerLoan.belongsTo(models.customerLoan, { foreignKey: 'unsecuredLoanId', as: 'unsecuredLoan', useJunctionTable: false });

        customerLoan.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        customerLoan.belongsTo(models.user, { foreignKey: 'bmId', as: 'bm' });

        customerLoan.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoan.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        customerLoan.hasMany(models.customerLoanIntrestCalculator, { foreignKey: 'loanId', as: 'customerLoanIntrestCalculator' });

    }

    customerLoan.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));

        var resOrna = []
        for (let i = 0; i < values.loanOrnamentsDetail.length; i++) {
            if (values.loanOrnamentsDetail[i].weightMachineZeroWeightData) {
                values.loanOrnamentsDetail[i].weightMachineZeroWeightData.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].weightMachineZeroWeightData.path;
            }
            if (values.loanOrnamentsDetail[i].withOrnamentWeightData) {
                values.loanOrnamentsDetail[i].withOrnamentWeightData.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].withOrnamentWeightData.path;
            }
            if (values.loanOrnamentsDetail[i].stoneTouchData) {
                values.loanOrnamentsDetail[i].stoneTouchData.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].stoneTouchData.path;
            }
            if (values.loanOrnamentsDetail[i].acidTestData) {
                values.loanOrnamentsDetail[i].acidTestData.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].acidTestData.path;
            }
            if (values.loanOrnamentsDetail[i].ornamentImageData) {
                values.loanOrnamentsDetail[i].ornamentImageData.URL = process.env.BASE_URL + values.loanOrnamentsDetail[i].ornamentImageData.path;
            }
            if (values.loanOrnamentsDetail[i].purityTestImage) {
                for (image of values.loanOrnamentsDetail[i].purityTestImage) {
                    image.purityTest.URL = process.env.BASE_URL + image.purityTest.path;
                }
            }
            resOrna.push(values.loanOrnamentsDetail[i])
        }

        if (values.loanBankDetail) {
            for (image of values.loanBankDetail.passbookProofImage) {
                image.passbookProof.URL = process.env.BASE_URL + image.passbookProof.path;
            }
        }

        resPac = []
        for (let i = 0; i < values.loanPacketDetails.length; i++) {

            if (values.loanPacketDetails[i].emptyPacketWithNoOrnamentData) {
                values.loanPacketDetails[i].emptyPacketWithNoOrnamentData.URL = process.env.BASE_URL + values.loanPacketDetails[i].emptyPacketWithNoOrnamentData.path;
            }
            if (values.loanPacketDetails[i].packetWithAllOrnamentsData) {
                values.loanPacketDetails[i].packetWithAllOrnamentsData = process.env.BASE_URL + values.loanPacketDetails[i].packetWithAllOrnamentsData.path;
            }
            if (values.loanPacketDetails[i].packetWithSealingData) {
                values.loanPacketDetails[i].packetWithSealingData.URL = process.env.BASE_URL + values.loanPacketDetails[i].packetWithSealingData.path;
            }
            if (values.loanPacketDetails[i].packetWithWeightData) {
                values.loanPacketDetails[i].packetWithWeightData.URL = process.env.BASE_URL + values.loanPacketDetails[i].packetWithWeightData.path;
            }
            resPac.push(values.loanPacketDetails[i])
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