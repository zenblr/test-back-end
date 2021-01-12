import { ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
@Component({
  selector: 'kt-select-payment',
  templateUrl: './select-payment.component.html',
  styleUrls: ['./select-payment.component.scss']
})
export class SelectPaymentComponent implements OnInit {

  
  @Input() amount;
  @Input() minDate;
  @Output() paymentValueFinal = new EventEmitter();
  @Output() paymentData = new EventEmitter();
  paymentTypeList = [{ value: 'netbanking', name: 'Net Banking', image: 'assets/net-banking.png' },
  { value: 'card', name: 'Debit Card', image: 'assets/debit-card.png' },
  { value: 'upi', name: 'UPI', image: 'assets/upi.png' },
  { value: 'wallet', name: 'Wallet', image: 'assets/wallet.png' }, { value: 'IMPS', name: 'IMPS' }, { value: 'NEFT', name: 'NEFT' }, { value: 'RTGS', name: 'RTGS' }, { value: 'cheque', name: 'cheque' }]
  showPaymentValue: FormControl = new FormControl();
  paymentValue = {
    bankName: null,
    branchName: null,
    chequeNumber: null,
    depositDate: null,
    paidAmount: null,
    paymentType: '',
    transactionId: null,
  }
  constructor(
    private ref: ChangeDetectorRef,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      console.log(changes)
    }
  }

  choosePaymentMethod() {
    if (this.amount && this.amount) {
      this.paymentValue.paidAmount = this.amount
    }
    if (this.showPaymentValue.value == 'upi' || this.showPaymentValue.value == 'netbanking' || this.showPaymentValue.value == 'wallet' || this.showPaymentValue.value == 'card') {
      this.paymentValue = {
        bankName: null,
        branchName: null,
        chequeNumber: null,
        depositDate: new Date(),
        paidAmount: this.amount,
        paymentType: this.showPaymentValue.value,
        transactionId: null,
      }
      this.paymentTypeData(this.paymentValue)
      return
    }
    if (this.showPaymentValue.value) {
      this.paymentValue.paymentType = this.showPaymentValue.value
    }
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        value: this.paymentValue ,
        date: this.minDate
      },
      width: '600px'
    })
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.paymentTypeData(res)
      }else{
        this.showPaymentValue.reset()
      }
    })
  }

  paymentTypeData(res) {
    if (res['paymentType']) {
      // this.showPaymentValue = true;
      this.paymentValue = res;
      if (this.paymentValue['paymentType'] == 'upi') {
        this.paymentValueFinal.emit("UPI");
      }
      else {
        this.paymentValueFinal.emit(this.paymentValue['paymentType']);
      }
      this.paymentData.emit(this.paymentValue)
      this.ref.detectChanges()

    }
  }

}
