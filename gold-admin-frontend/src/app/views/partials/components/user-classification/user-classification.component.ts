import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { UserDetailsService } from '../../../../core/kyc-settings/services/user-details.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerClassificationService } from '../../../../core/kyc-settings/services/customer-classification.service';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UserBankService } from '../../../../core/kyc-settings/services/user-bank.service';
import { AppliedKycService } from '../../../../core/applied-kyc/services/applied-kyc.service';
import { Router } from '@angular/router';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'kt-user-classification',
  templateUrl: './user-classification.component.html',
  styleUrls: ['./user-classification.component.scss'],
  providers: [TitleCasePipe]
})
export class UserClassificationComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  cceKycStatus = [{ value: 'approved', name: 'approved' }, { value: 'pending', name: 'pending' }, { value: 'rejected', name: 'rejected' }];
  bmKycStatus = [{ value: 'approved', name: 'approved' }, { value: 'incomplete', name: 'incomplete' }, { value: 'rejected', name: 'rejected' }];

  // kycStatus = [];
  rating = [];
  custClassificationForm: FormGroup;
  custClassificationFormBM: FormGroup;

  customerDetails = this.userDetailsService.userData;
  // customerDetails = {
  //   "customerId": 2,
  //   "customerKycId": 2,
  //   "customerKycCurrentStage": "6",
  //   KycClassification: {
  //     id: 1,
  //     customerId: 2,
  //     customerKycId: 1,
  //     behaviourRatingCce: 3,
  //     idProofRatingCce: 2,
  //     addressProofRatingCce: 2,
  //     kycStatusFromCce: 'pending',
  //     reasonFromCce: 'ad',
  //     cceId: 1,
  //     behaviourRatingVerifiedByBm: false,
  //     idProofRatingVerifiedByBm: false,
  //     addressProofRatingVerifiedBm: false,
  //     kycStatusFromOperationalTeam: 'rejected',
  //     reasonFromOperationalTeam: null,
  //     branchManagerId: null,
  //     createdAt: "2020-05-11T13:28:22.997Z",
  //     updatedAt: "2020-05-11T13:28:22.997Z"
  //   }
  // }

  showTextBoxCce = false;
  showTextBoxBM = false;
  editRating = false;
  userType: any;
  viewBMForm = true;
  reasons = [];

  constructor(
    private userDetailsService: UserDetailsService,
    private custClassificationService: CustomerClassificationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userBankService: UserBankService,
    private appliedKycService: AppliedKycService,
    private route: Router,
    private sharedService: SharedService,
    private titlecase: TitleCasePipe,
    private ref: ChangeDetectorRef
  ) {
    let res = this.sharedService.getDataFromStorage()
    this.userType = res.userDetails.userTypeId;

    this.getRating();
    this.getReasonsList();
  }

  ngOnInit() {
    if (this.userBankService.kycDetails) {
      if (this.userBankService.kycDetails.KycClassification !== null)
        this.customerDetails = this.userBankService.kycDetails.KycClassification
    } else {
      this.customerDetails = this.userDetailsService.userData;
    }

    this.initForm();
    this.conditionalValidation();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataBindingEdit();
    }, 1000)
  }

  dataBindingEdit() {
    const editable = this.appliedKycService.editKyc.getValue()
    if (editable.editable) {
      this.editRating = true;
      console.log(this.customerDetails)
      this.custClassificationForm.patchValue(this.customerDetails)
      this.custClassificationForm.patchValue({ reasonForOther: this.customerDetails.reasonFromCce })

      if (this.customerDetails.reasonFromCce) {
        var temp = this.reasons.filter(res => {
          return res.description == this.customerDetails.reasonFromCce
        })
        if (!temp.length) {
          this.cceControls.reasonForOther.patchValue('Other')
        }
      }
      this.ref.detectChanges();
    }
  }

  initForm() {
    this.custClassificationForm = this.fb.group({
      customerId: [this.customerDetails.customerId, [Validators.required]],
      customerKycId: [this.customerDetails.customerKycId, [Validators.required]],
      kycRatingFromCce: ['', [Validators.required]],
      kycRatingFromBM: [false, [Validators.required]],
      kycStatusFromCce: ['', [Validators.required]],
      reasonFromCce: [],
      reasonForOther: [''],
      kycStatusFromOperationalTeam: ['pending', [Validators.required]],
      reasonFromOperationalTeam: ['']
    })

    if (this.userType == 6) {
      // this.custClassificationForm.disable()
      // this.custClassificationForm.controls.behaviourRatingVerifiedByBm.disable();
      // this.custClassificationForm.controls.idProofRatingVerifiedByBm.disable();
      // this.custClassificationForm.controls.addressProofRatingVerifiedBm.disable();
      this.custClassificationForm.controls.kycRatingFromBM.disable();
      this.custClassificationForm.controls.kycStatusFromOperationalTeam.disable();
      this.custClassificationForm.controls.reasonFromOperationalTeam.disable();
      this.viewBMForm = false;
    } else if (this.userType == 8) {
      //   this.custClassificationForm.controls.behaviourRatingCce.disable();
      //   this.custClassificationForm.controls.idProofRatingCce.disable();
      //   this.custClassificationForm.controls.addressProofRatingCce.disable();
      this.custClassificationForm.controls.kycRatingFromCce.disable();
      this.custClassificationForm.controls.kycStatusFromCce.disable();
      this.custClassificationForm.controls.reasonFromCce.disable();
    } else {
      this.custClassificationForm.disable()
    }
  }

  conditionalValidation() {
    // this.custClassificationForm.get('kycRatingFromCce').valueChanges.subscribe(res => {
    // if (this.custClassificationForm.controls.kycRatingFromCce.valid && this.custClassificationForm.controls.kycStatusFromCce.valid) {
    if ((this.custClassificationForm.controls.kycRatingFromCce.value == '5' || this.custClassificationForm.controls.kycRatingFromCce.value == '4') && this.custClassificationForm.controls.kycStatusFromCce.value == 'approved') {
      this.custClassificationForm.get('reasonFromCce').clearValidators();
      // if (!this.editRating) {
      this.custClassificationForm.get('reasonFromCce').patchValue('');
      // }
      this.showTextBoxCce = false;
    } else {
      this.custClassificationForm.get('reasonFromCce').setValidators(Validators.required);
      this.showTextBoxCce = true;
    }
    this.custClassificationForm.get('reasonFromCce').updateValueAndValidity();
    // }

    // Validation for BM
    this.custClassificationForm.get('kycStatusFromOperationalTeam').valueChanges.subscribe(res => {
      if (res == 'approved') {
        this.custClassificationForm.get('reasonFromOperationalTeam').clearValidators();
        this.custClassificationForm.get('reasonFromOperationalTeam').patchValue('');
        this.showTextBoxBM = false;
      } else if (res && res != 'pending') {
        this.custClassificationForm.get('reasonFromOperationalTeam').reset();
        this.custClassificationForm.get('reasonFromOperationalTeam').setValidators(Validators.required);
        this.showTextBoxBM = true;
      }
      this.custClassificationForm.get('reasonFromOperationalTeam').updateValueAndValidity();
    })
  }

  getRating() {
    this.custClassificationService.getRating().pipe(
      map(res => {
        this.rating = res.data;
      })
    ).subscribe()
  }

  getReasonsList() {
    this.custClassificationService.getReasonsList().pipe(
      map(res => {
        console.log(res)
        this.reasons = res.data;
      })
    ).subscribe()
  }

  submit() {

    console.log(this.custClassificationForm.value)


    if (this.custClassificationForm.invalid) {
      this.custClassificationForm.markAllAsTouched();
      if (this.custClassificationForm.controls.reasonFromCce.invalid) {
        this.custClassificationForm.controls.reasonFromCce.setErrors({ 'reasonRequired': true })
      }
      return;
    }

    console.log(this.custClassificationForm.value)

    this.custClassificationForm.patchValue({
      behaviourRatingCce: +(this.custClassificationForm.get('kycRatingFromCce').value),
      // idProofRatingCce: +(this.custClassificationForm.get('idProofRatingCce').value),
      // addressProofRatingCce: +(this.custClassificationForm.get('addressProofRatingCce').value),
    })

    if (this.editRating) {
      this.custClassificationService.updateCceRating(this.custClassificationForm.value).pipe(
        map(res => {
          if (res) {
            this.toastr.success(this.titlecase.transform(res.message));
            // this.next.emit(true);
            this.route.navigate(['/admin/applied-kyc']);
          }
        })
      ).subscribe();
    } else {
      this.custClassificationService.cceRating(this.custClassificationForm.value).pipe(
        map(res => {
          if (res) {
            this.toastr.success(this.titlecase.transform(res.message));
            // this.next.emit(true);
            this.route.navigate(['/admin/applied-kyc']);

          }
        })
      ).subscribe();
    }

  }

  get cceControls() {
    return this.custClassificationForm.controls;
  }

  approvalOfBM(value: boolean, type: string) {
    if (this.userType == 8) {
      if (type == 'kycRating') {
        this.cceControls.kycRatingFromBM.patchValue(value)
      }
      // else if (type == 'identity') {
      //   this.cceControls.idProofRatingVerifiedByBm.patchValue(value)
      // } else if (type == 'address') {
      //   this.cceControls.addressProofRatingVerifiedBm.patchValue(value)
      // }
    }
  }

  patchReason() {
    if (this.cceControls.reasonForOther.value != "Other") {
      this.cceControls.reasonFromCce.patchValue(this.cceControls.reasonForOther.value)

    } else {
      this.cceControls.reasonFromCce.reset()
    }
  }

  resetKYCStatus() {
    this.cceControls.kycStatusFromCce.patchValue('')
    this.cceControls.kycStatusFromCce.markAsUntouched()
  }
}
