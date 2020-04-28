import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { UserBankService } from '../../../../../core/kyc-settings/services/user-bank.service';
import { UserDetailsService } from '../../../../../core/kyc-settings';

@Component({
  selector: 'kt-user-banks',
  templateUrl: './user-banks.component.html',
  styleUrls: ['./user-banks.component.scss']
})
export class UserBanksComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  bankForm: FormGroup;
  customerDetails = this.userDetailsService.userData;
  // customerDetails = { customerId: 1, customerKycId: 2 }
  file: any;
  passBookImage = [];

  constructor(private fb: FormBuilder, private sharedService: SharedService,
    private userBankService: UserBankService, private userDetailsService: UserDetailsService) { }

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
      ifscCode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
      passbookProof: []
    })
  }

  getFileInfo(event) {
    this.file = event.target.files[0];
    console.log(this.file);
    this.sharedService.uploadFile(this.file).pipe(
      map(res => {
        this.passBookImage.push(res.uploadFile.URL);
        // this.bankForm.patchValue({ passbookProof: this.passBookImage });

        this.bankForm.get('passbookProof').patchValue(event.target.files[0].name);
        console.log(this.bankForm.value);
      }), catchError(err => {
        // this.toastr.errorToastr(err.error.message);
        throw err
      })).subscribe()
  }

  submit() {
    console.log(this.bankForm.value);

    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched()
      return
    }


    this.bankForm.patchValue({ passbookProof: this.passBookImage });
    console.log(this.bankForm.value)

    const basicForm = this.bankForm.value;
    this.userBankService.bankDetails(basicForm).pipe(
      map(res => {
        console.log(res);
        if (res) {
          this.next.emit(true);
        }
      }),
      finalize(() => {
        this.bankForm.get('passbookProof').patchValue(this.file.name);
        console.log(this.bankForm.value)
      })
    ).subscribe();

  }

  get controls() {
    return this.bankForm.controls;
  }
}
