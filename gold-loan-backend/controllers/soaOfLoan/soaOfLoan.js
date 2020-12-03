const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
let { getSingleMasterLoanDetail } = require('../../utils/loanFunction');
const xl = require('excel4node');


exports.getSoa = async (req, res) => {
    let { masterLoanId, startDate, endDate } = req.body;
    let masterLoan = await getSingleMasterLoanDetail(masterLoanId);
    let customerLoanId = await masterLoan.customerLoan.map((data) => data.loanUniqueId);
    let customerLoanIdtoString = customerLoanId.toString();
    let account = await models.customerTransactionDetail.findAll({
        where: { masterLoanId: masterLoanId },
        order: [['id', 'ASC']],
        include: [{
            model: models.customerLoanTransaction,
            as: 'transaction'
        }]
    });
    //Excel
    let wb = new xl.Workbook({dateFormat: 'dd/mm/yyyy',numberFormat: '##.00,##0.00; (#,##0.00); #.00'});
    let ws = wb.addWorksheet('report');
    const style = wb.createStyle({
        alignment: { 
            wrapText: true
        },border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
          }
    });
    const style2 = wb.createStyle({
        alignment: { 
            wrapText: true,
            horizontal:'center'
        },
        font: {
            bold: true
          }
    });
    const customerStyle = wb.createStyle({
        alignment: { 
            wrapText: true,
            horizontal:'left'
        }
    });
    // Create a reusable style
    var numberStyle = wb.createStyle({
        numberFormat: '#.00; -#.00; 0.00',
    });
    //Column
    ws.column(1).setWidth(10);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(14);
    ws.column(4).setWidth(10);
    ws.column(5).setWidth(10);
    ws.column(6).setWidth(12);
    ws.column(7).setWidth(12);
    ws.column(8).setWidth(12);
    ws.column(9).setWidth(12);
    ws.column(10).setWidth(12);
    ws.column(11).setWidth(12);
    ws.column(12).setWidth(12);
    ws.column(13).setWidth(12);
    ws.column(14).setWidth(12);
    //Title
    ws.cell(1, 2, 1, 12, true).string("Statement of Account").style(style2);
    //Customer details:
    ws.cell(2, 2, 5, 5, true).string(`To,
Customer Name: ${masterLoan.customer.firstName} ${masterLoan.customer.lastName}
Mobile: ${masterLoan.customer.mobileNumber}
Customer ID: ${masterLoan.customer.customerUniqueId}`).style(customerStyle);

ws.cell(7, 2, 7, 5, true).string("Loan No").style(style);
ws.cell(7, 6, 7, 7, true).string(`${customerLoanIdtoString}`).style(style);
ws.cell(8, 2, 8, 5, true).string("Tenure").style(style);
ws.cell(8, 6, 8, 7, true).string(`${masterLoan.tenure}`).style(style);
ws.cell(9, 2, 9, 5, true).string("Frequency in days").style(style);
ws.cell(9, 6, 9, 7, true).string(`${masterLoan.customerLoan[0].selectedSlab}`).style(style);
ws.cell(10, 2, 10, 5, true).string("Loan amount").style(style);
ws.cell(10, 6, 10, 7, true).string(`${masterLoan.finalLoanAmount}`).style(style);
ws.cell(11, 2, 11, 5, true).string("Loan outstanding amount").style(style);
ws.cell(11, 6, 11, 7, true).string(`${masterLoan.outstandingAmount}`).style(style);

    //account opening
    ws.cell(16, 1).string("Transaction Date").style(style);
    ws.cell(16, 2).string("Transaction Type Narration").style(style);
    ws.cell(16, 3).string("Reference ID").style(style);
    ws.cell(16, 4).string("Payment Type").style(style);
    ws.cell(16, 5).string("Transaction ID").style(style);
    ws.cell(16, 6).string("Bank Transaction Unique ID").style(style);
    ws.cell(16, 7).string("Cheque Number").style(style);
    ws.cell(16, 8).string("Bank Name").style(style);
    ws.cell(16, 9).string("Branch Name").style(style);
    ws.cell(16, 10).string("Deposit Status").style(style);
    ws.cell(16, 11).string("Augmont rebate").style(style);
    ws.cell(16, 12).string("Debit in Rs").style(style);
    ws.cell(16, 13).string("Credit in Rs").style(style);
    ws.cell(16, 14).string("Closing Balance due in Rs").style(style);
    ws.cell(17, 1).date(masterLoan.loanStartDate).style(style);
    ws.cell(17, 2).string("Opening Balance").style(style);
    ws.cell(17, 3).string("-").style(style);
    ws.cell(17, 4).string("-").style(style);
    ws.cell(17, 5).string("-").style(style);
    ws.cell(17, 6).string("-").style(style);
    ws.cell(17, 7).string("-").style(style);
    ws.cell(17, 8).string("-").style(style);
    ws.cell(17, 9).string("-").style(style);
    ws.cell(17, 10).string("-").style(style);
    ws.cell(17, 11).number(0.00).style(numberStyle).style(style);
    ws.cell(17, 12).number(0.00).style(numberStyle).style(style);
    ws.cell(17, 13).number(0.00).style(numberStyle).style(style);
    ws.cell(17, 14).number(0.00).style(numberStyle).style(style);
    let closingBalance = 0;
    for (let i = 0; account.length > i; i++) {
        if(account[i].paymentDate){
            ws.cell(i + 18, 1).date(account[i].paymentDate).style(style);
        }else{
            ws.cell(i + 18, 1).string('-').style(style);
        }
        
        ws.cell(i + 18, 2).string(account[i].description).style(style);
        ws.cell(i + 18, 3).string(account[i].referenceId).style(style);
        //
        if (account[i].customerLoanTransactionId != null) {
            ws.cell(i + 18, 4).string(account[i].transaction.paymentType).style(style);
            ws.cell(i + 18, 5).string(account[i].transaction.transactionUniqueId).style(style);
            ws.cell(i + 18, 6).string(account[i].transaction.bankTransactionUniqueId).style(style);
            ws.cell(i + 18, 7).string(account[i].transaction.chequeNumber).style(style);
            ws.cell(i + 18, 8).string(account[i].transaction.bankName).style(style);
            ws.cell(i + 18, 9).string(account[i].transaction.branchName).style(style);
            ws.cell(i + 18, 10).string(account[i].transaction.depositStatus).style(style);
        } else {
            ws.cell(i + 18, 4).string("-").style(style);
            ws.cell(i + 18, 5).string("-").style(style);
            ws.cell(i + 18, 6).string("-").style(style);
            ws.cell(i + 18, 7).string("-").style(style);
            ws.cell(i + 18, 8).string("-").style(style);
            ws.cell(i + 18, 9).string("-").style(style);
            ws.cell(i + 18, 10).string("-").style(style);
        }
        ws.cell(i + 18, 11).number(Number(account[i].rebateAmount)).style(numberStyle).style(style);
        ws.cell(i + 18, 12).number(Number(account[i].debit)).style(numberStyle).style(style);
        ws.cell(i + 18, 13).number(Number(account[i].credit)).style(numberStyle).style(style);
        closingBalance = Number(closingBalance.toFixed(2)) + Number(account[i].debit) - Number(account[i].credit);
        ws.cell(i + 18, 14).number(Math.abs(Number(closingBalance))).style(numberStyle).style(style);
    }
    return wb.write(`${Date.now()}.xlsx`, res);
    // return res.status(200).json({ message: "Success",masterLoan });
}

