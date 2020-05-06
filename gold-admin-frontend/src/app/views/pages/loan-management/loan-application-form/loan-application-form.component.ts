import { Component, OnInit, ChangeDetectorRef, ElementRef  } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-loan-application-form',
  templateUrl: './loan-application-form.component.html',
  styleUrls: ['./loan-application-form.component.scss']
})
export class LoanApplicationFormComponent implements OnInit {
  
  
  invalid = {
    basic: false,
    kyc: false,
    nominee: false,
    bank: false,
    approval: false,
    ornaments: false,
    intreset: false,
  }
  totalAmount: number = 0;
  basic: any;
  disable: boolean = false;
  kyc: any;
  nominee: any;
  selected: number;
  constructor(
    public ref: ChangeDetectorRef,
    public router: Router,
    private ele:ElementRef
  ) {
   
  }

  ngOnInit() {
    setTimeout(()=>{
      if (this.router.url == "/loan-management/package-image-upload") {
        this.disable = false;
        const test = document.getElementById('packets');
        test.scrollIntoView({behavior:"smooth"});
      }else{
        this.disable = true;
      }
    },500)
  }


  basicForm(event) {
    this.basic = event
  }

  kycEmit(event) {
    this.kyc = event
  }

  nomineeEmit(event) {
    this.nominee = event
  }

  cancel() {
    this.ngOnInit()
  }

  checkForFormValidation() {
    if (this.basic)
      if (this.basic.invalid) {
        this.selected = 0;
        this.invalid.basic = true;
        return
      }

    if (this.kyc)
      if (this.kyc.invalid) {
        this.selected = 1;
        this.invalid.kyc = true;
        return
      }

    if (this.nominee)
      if (this.nominee.invalid) {
        this.selected = 2;
        this.invalid.nominee = true;
        return
      }

  }

  apply() {
    this.checkForFormValidation()
  }
}
