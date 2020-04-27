import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'kt-user-banks',
  templateUrl: './user-banks.component.html',
  styleUrls: ['./user-banks.component.scss']
})
export class UserBanksComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  bankForm: FormGroup;
  // customerDetails = this.userDetailsService.userData;
  customerDetails = { customerId: 1, customerKycId: 2 }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.bankForm = this.fb.group({
      customerId: [this.customerDetails.customerId],
      customerKycId: [this.customerDetails.customerKycId],
      bankName: ['', [Validators.required]],
      bankBranchName: ['', [Validators.required]],
      accountType: ['', [Validators.required]],
      accountHolderName: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      ifcCode: ['', [Validators.required]],
    })
  }

  submit() {
    this.next.emit(true);
  }

}
