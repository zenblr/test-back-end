import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { OrnamentsComponent } from '../../../../partials/components/ornaments/ornaments.component';
import { PaymentDialogComponent } from '../../../../partials/components/payment-dialog/payment-dialog.component';

@Component({
  selector: 'kt-top-up',
  templateUrl: './top-up.component.html',
  styleUrls: ['./top-up.component.scss']
})
export class TopUpComponent implements OnInit {

  inputEligibleAmount: boolean;
  showPaymentConfirmation: boolean;
  topUp = new FormControl(null, Validators.required);
  paymentValue: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private ele: ElementRef,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  eligibleTopUp() {
    this.inputEligibleAmount = !this.inputEligibleAmount;
  }

  enterTopUp() {
    if (this.topUp.invalid) return this.topUp.markAsTouched()
    this.showPaymentConfirmation = !this.showPaymentConfirmation;
    this.scrollToBottom()
  }

  pay() {

  }

  viewOrnaments(item) {
    // const packetArr = item.map(e => ({ ...e, packetId: e.packets[0].packetUniqueId }))

    this.dialog.open(OrnamentsComponent, {
      data: {
        modal: true,
        // modalData: packetArr,
        modalData: {},
        packetView: false
      },
      width: '90%'
    })
  }

  cancelTopUp() {
    this.inputEligibleAmount = !this.inputEligibleAmount
  }

  choosePaymentMethod() {
    if (this.paymentValue && this.paymentValue.paidAmount) {
      this.paymentValue.paidAmount = this.topUp.value
    }
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      data: {
        value: this.paymentValue ? this.paymentValue : { paidAmount: this.topUp.value },
        // date: this.loanDetails.loan.loanStartDate
      },
      width: '500px'
    })

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.paymentValue = res;
        this.ref.detectChanges()
      }
    })
  }

  scrollToBottom() {
    setTimeout(() => {
      let view = this.ele.nativeElement.querySelector('#container') as HTMLElement
      view.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 500)
  }

}
