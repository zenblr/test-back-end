import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { OrnamentsComponent } from '../loan-application-form/tabs/ornaments/ornaments.component';

@Component({
  selector: 'kt-top-up',
  templateUrl: './top-up.component.html',
  styleUrls: ['./top-up.component.scss']
})
export class TopUpComponent implements OnInit {

  inputEligibleAmount: boolean;
  showPaymentConfirmation: boolean;
  topUpForm: FormGroup;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.topUpForm = this.fb.group({
      eligbileTopUp: [],
      processingCharge: [],
      topUp: [],
    })
  }

  eligibleTopUp() {
    this.inputEligibleAmount = !this.inputEligibleAmount;
  }

  viewOrnaments() {
    // this.router.navigate([])
    const dialogRef = this.dialog.open(OrnamentsComponent, {
      width: 'auto',
      data: 'view'
    });
  }

  enterTopUp() {
    this.showPaymentConfirmation = !this.showPaymentConfirmation;
  }

  pay() {

  }

}
