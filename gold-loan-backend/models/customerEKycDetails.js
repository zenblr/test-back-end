module.exports = (sequelize, DataTypes) => {
    const CustomerEKycDetails = sequelize.define('customerEKycDetails', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        isAppliedForPanVerification: {
            type: DataTypes.BOOLEAN,
            field: 'is-applied-for-pan-verification',
            defaultValue: false
        },
        isPanVerified: {
            type: DataTypes.BOOLEAN,
            field: 'is-pan-verified',
            defaultValue: false
        },
        panNameScore: {
            type: DataTypes.STRING,
            field: 'pan-name-score',
        },
        panName: {
            type: DataTypes.STRING,
            field: 'pan-name',
        },
        fatherName: {
            type: DataTypes.STRING,
            field: 'father_name',
        },
        panDOBScore: {
            type: DataTypes.STRING,
            field: 'pan-DOB-score',
        },
        panDOB: {
            type: DataTypes.STRING,
            field: 'pan-DOB',
        },
        panNumber: {
            type: DataTypes.STRING,
            field: 'pan-number',
        },
        isAppliedForAahaarVification: {
            type: DataTypes.BOOLEAN,
            field: 'is-applied-for-aahaar-verification',
            defaultValue: false
        },
        isAahaarVerified: {
            type: DataTypes.BOOLEAN,
            field: 'is-aahaar-verified',
            defaultValue: false
        },
        gender : {
            type: DataTypes.STRING,
            field: 'gender'
        },
        aahaarNameScore: {
            type: DataTypes.STRING,
            field: 'aahaar-name-score',
        },
        aahaarName: {
            type: DataTypes.STRING,
            field: 'aahaar-name',
        },
        aahaarDOBScore: {
            type: DataTypes.STRING,
            field: 'aahaar-DOB-score',
        },
        aahaarDOB: {
            type: DataTypes.STRING,
            field: 'aahaar-DOB',
        },
        aahaarNumber: {
            type: DataTypes.STRING,
            field: 'aahaar-number',
        },
        aadhaarAddress: {
            type: DataTypes.STRING,
            field: 'aadhaar-address',
        },
        aadhaarPinCode: {
            type: DataTypes.STRING,
            field: 'aadhaar-pin-code',
        },
        aadhaarState: {
            type: DataTypes.STRING,
            field: 'aadhaar-state',
        },
        aadhaarCity: {
            type: DataTypes.STRING,
            field: 'aadhaar-city',
        },
        aadharAndPanNameScore: {
            type: DataTypes.STRING,
            field: 'aadhar-and-pan-name-score',
        },
        isAadhaarAndPanDOBSame: {
            type: DataTypes.BOOLEAN,
            field: 'is-aadhaar-and-pan-DOB-same',
            defaultValue: false
        },
        voterIdNumber: {
            type: DataTypes.STRING,
            field: 'voter-id-number',
        },
        isVoterIdConfPass: {
            type: DataTypes.BOOLEAN,
            field: 'is-voter-id-conf-pass',
            defaultValue: false
        },
        VoterIdAddress: {
            type: DataTypes.STRING,
            field: 'voter-id-address',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }

    }, {
        freezeTableName: true,
        tableName: 'customer_e_kyc_details',
    });

    return CustomerEKycDetails;
}