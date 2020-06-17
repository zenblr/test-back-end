import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoanApplicationFormService } from '../../../../../../../core/loan-management';

@Component({
  selector: 'kt-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit, OnChanges {

  @Input() loanId
  @ViewChild('passbook', { static: false }) passbook
  @Input() details;
  @Output() bankFormEmit: EventEmitter<any> = new EventEmitter();
  @Input() disable
  @Input() action
  @Input() finalLoanAmt
  @Output() next: EventEmitter<any> = new EventEmitter();
  bankForm: FormGroup;
  passbookImg: any = [];
  constructor(
    public toastr: ToastrService,
    public ref: ChangeDetectorRef,
    public fb: FormBuilder,
    public sharedService: SharedService,
    public loanFormService: LoanApplicationFormService,
  ) {
    this.initForm()
  }

  ngOnInit() {

  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes.details) {
      if (changes.action.currentValue == 'edit') {
        if (changes.details.currentValue && changes.details.currentValue.loanBankDetail) {
          this.bankForm.patchValue(changes.details.currentValue.loanBankDetail)
          this.ref.markForCheck()
        }
      }

      this.bankFormEmit.emit(this.bankForm);
    }
    if (changes.finalLoanAmt) {
      if (changes.finalLoanAmt.currentValue > '200000') {
        this.controls.paymentType.patchValue('bank')
        this.controls.paymentType.disable()
      }
    }
    if (this.disable) {
      this.bankForm.disable()
    }
  }

  initForm() {
    this.bankForm = this.fb.group({
      paymentType: ['', Validators.required],
      bankName: [, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]],
      accountNumber: [, [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
      accountType: [],
      accountHolderName: [, [Validators.required]],
      bankBranchName: [, [Validators.required]],
      passbookProof: [[]],
      passbookProofImage: ['']
    })
    // this.bankForm.disable()
  }

  setValidation(event) {
    if (event.target.value == 'bank') {
      this.controls.bankName.setValidators([Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\-\\s]*$')]);
      this.controls.accountNumber.setValidators([Validators.required]);
      this.controls.ifscCode.setValidators([Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]);
      this.controls.accountHolderName.setValidators([Validators.required]);
      this.controls.bankBranchName.setValidators([Validators.required]);
      this.controls.passbookProof.setValidators([Validators.required]);
    } else if (event.target.value == 'cash') {
      Object.keys(this.bankForm.controls).forEach(key => {
        if (key != 'paymentType') {
          this.bankForm.controls[key].reset();
          this.bankForm.controls[key].clearValidators();
        }
        if (key == 'passbookProof') {
          this.bankForm.controls[key].patchValue([])
        }
      });
    }
    Object.keys(this.bankForm.controls).forEach(key => {
      this.bankForm.controls[key].updateValueAndValidity();
    });
  }

  getFileInfo(event) {
    if (this.controls.passbookProof.value.length < 2) {
      var name = event.target.files[0].name
      var ext = name.split('.')
      if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
        this.sharedService.uploadFile(event.target.files[0]).pipe(
          map(res => {
            this.passbookImg.push(res.uploadFile.URL);
            this.bankForm.patchValue({ passbookProof: this.passbookImg });
            this.bankForm.get('passbookProofImage').patchValue(event.target.files[0].name);
            this.ref.detectChanges();
            console.log(this.bankForm.value);
          }), catchError(err => {
            // this.toastr.error(err.error.message);
            throw err
          }), finalize(() => {
            this.passbook.nativeElement.value = ''
          })).subscribe();
        this.ref.detectChanges();
      } else {
        this.toastr.error('Upload Valid File Format');
      }
    } else {
      this.toastr.error('Cannot upload more than two images');
    }

  }

  removeImages(index) {
    this.passbookImg.splice(index, 1);
    console.log(this.passbookImg)
    this.bankForm.get('passbookProof').patchValue(this.passbookImg);
    this.bankForm.get('passbookProofImage').patchValue('');
  }

  get controls() {
    if (this.bankForm)
      return this.bankForm.controls
  }

  nextAction() {
    if (this.controls.paymentType.invalid) {
      this.controls.paymentType.markAsTouched();
      return
    }
    if (this.controls.paymentType.value == "bank") {
      if (this.bankForm.invalid) {
        this.bankForm.markAllAsTouched()
        return
      }
    }
    this.loanFormService.submitBank(this.bankForm.value, this.loanId).pipe(
      map(res => {
        this.next.emit(5)
      })).subscribe()
  }

}