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
    let account = await models.customerTransactionDetail.findAll({
        where: { masterLoanId: masterLoanId },
        order: [['id', 'ASC']],
        include: [{
            model: models.customerLoanTransaction,
            as: 'transaction'
        }]
    });
    //Excel
    let wb = new xl.Workbook({dateFormat: 'dd/mm/yyyy',numberFormat: '#.00; (#.00); 0.00'});
    let ws = wb.addWorksheet('report');
    const style = wb.createStyle({
        font: {
            color: '#000000'
        },
        alignment: { 
            wrapText: true
        }
    });
    // Create a reusable style
    var numberStyle = wb.createStyle({
        numberFormat: '#.00; (#.00); 0.00',
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
    ws.column(10).setWidth(9);
    ws.column(11).setWidth(12);
    ws.column(12).setWidth(12);
    ws.column(13).setWidth(12);
    //account opening
    ws.cell(1, 1).string("Transaction Date").style(style);
    ws.cell(1, 2).string("Transaction Type Narration").style(style);
    ws.cell(1, 3).string("Reference ID").style(style);
    ws.cell(1, 4).string("Payment Type").style(style);
    ws.cell(1, 5).string("Transaction ID").style(style);
    ws.cell(1, 6).string("Bank Transaction Unique ID").style(style);
    ws.cell(1, 7).string("Cheque Number").style(style);
    ws.cell(1, 8).string("Bank Name").style(style);
    ws.cell(1, 9).string("Branch Name").style(style);
    ws.cell(1, 10).string("Deposit Status").style(style);
    ws.cell(1, 11).string("Debit in Rs").style(style);
    ws.cell(1, 12).string("Credit in Rs").style(style);
    ws.cell(1, 13).string("Closing Balance due in Rs").style(style);
    ws.cell(2, 1).date(null);
    ws.cell(2, 2).string("Opening Balance");
    ws.cell(2, 3).string("-");
    ws.cell(2, 4).string("-");
    ws.cell(2, 5).string("-");
    ws.cell(2, 6).string("-");
    ws.cell(2, 7).string("-");
    ws.cell(2, 8).string("-");
    ws.cell(2, 9).string("-");
    ws.cell(2, 10).string("-");
    ws.cell(2, 11).number(0.00).style(numberStyle);
    ws.cell(2, 12).number(0.00).style(numberStyle);
    ws.cell(2, 13).number(0.00).style(numberStyle);
    let closingBalance = 0;
    for (let i = 0; account.length > i; i++) {
        ws.cell(i + 3, 1).date(account[i].createdAt);
        ws.cell(i + 3, 2).string(account[i].description).style(style);
        ws.cell(i + 3, 3).string(account[i].referenceId);
        //
        if (account[i].customerLoanTransactionId != null) {
            ws.cell(i + 3, 4).string(account[i].transaction.paymentType);
            ws.cell(i + 3, 5).string(account[i].transaction.transactionUniqueId);
            ws.cell(i + 3, 6).string(account[i].transaction.bankTransactionUniqueId);
            ws.cell(i + 3, 7).string(account[i].transaction.chequeNumber);
            ws.cell(i + 3, 8).string(account[i].transaction.bankName);
            ws.cell(i + 3, 9).string(account[i].transaction.branchName);
            ws.cell(i + 3, 10).string(account[i].transaction.depositStatus);
        } else {
            ws.cell(i + 3, 4).string("-");
            ws.cell(i + 3, 5).string("-");
            ws.cell(i + 3, 6).string("-");
            ws.cell(i + 3, 7).string("-");
            ws.cell(i + 3, 8).string("-");
            ws.cell(i + 3, 9).string("-");
            ws.cell(i + 3, 10).string("-");
        }
        ws.cell(i + 3, 11).number(Number(account[i].debit)).style(numberStyle);
        ws.cell(i + 3, 12).number(Number(account[i].credit)).style(numberStyle);
        closingBalance = Number(closingBalance) + Number(account[i].debit) - Number(account[i].credit);
        ws.cell(i + 3, 13).number(Number(closingBalance)).style(numberStyle);
    }
    return wb.write(`${Date.now()}.xlsx`, res);
    // return res.status(200).json({ message: "success",account });
}

