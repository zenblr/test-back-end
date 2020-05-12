import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserDetailsService } from '../../../../core/kyc-settings/services/user-details.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerClassificationService } from '../../../../core/kyc-settings/services/customer-classification.service';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UserBankService } from '../../../../core/kyc-settings/services/user-bank.service';

@Component({
  selector: 'kt-user-classification',
  templateUrl: './user-classification.component.html',
  styleUrls: ['./user-classification.component.scss']
})
export class UserClassificationComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  cceKycStatus = [{ value: 'approved', name: 'approved' }, { value: 'pending', name: 'pending' }];
  bmKycStatus = [{ value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }];

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
  //     kycStatusFromBm: 'rejected',
  //     reasonFromBm: null,
  //     branchManagerId: null,
  //     createdAt: "2020-05-11T13:28:22.997Z",
  //     updatedAt: "2020-05-11T13:28:22.997Z"
  //   }
  // }

  showTextBoxCce = true;
  showTextBoxBM = true;
  editRating: boolean;
  role: any;

  constructor(
    private userDetailsService: UserDetailsService,
    private custClassificationService: CustomerClassificationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userBankService: UserBankService
  ) {
    var token = localStorage.getItem('accessToken');
    var decodedValue = JSON.parse(atob(token.split('.')[1]));
    this.role = decodedValue.roleName[0]
    console.log(this.role);
  }

  ngOnInit() {
    if (this.userBankService.kycDetails.KycClassification !== null) {
      this.customerDetails = this.userBankService.kycDetails.KycClassification
    } else {
      this.userDetailsService.userData;
    }
    this.getRating();
    this.initForm();
    this.dataBindingEdit();
    this.conditionalValidation();
  }

  dataBindingEdit() {
    if (this.customerDetails) {
      this.editRating = true;
      console.log(this.customerDetails.KycClassification)
      this.custClassificationForm.patchValue(this.customerDetails)
      // console.log(this.custClassificationForm.value)
      // this.custClassificationForm.patchValue({
      //   customerId: this.customerDetails.KycClassification.customerId,
      //   customerKycId: this.customerDetails.KycClassification.customerKycId,
      //   behaviourRatingCce: this.customerDetails.KycClassification.behaviourRatingCce,
      //   idProofRatingCce: this.customerDetails.KycClassification.idProofRatingCce,
      //   addressProofRatingCce: this.customerDetails.KycClassification.addressProofRatingCce,
      //   kycStatusFromCce: this.customerDetails.KycClassification.kycStatusFromCce,
      //   reasonFromCce: this.customerDetails.KycClassification.reasonFromCce,
      //   behaviourRatingVerifiedByBm: this.customerDetails.KycClassification.behaviourRatingVerifiedByBm,
      //   idProofRatingVerifiedByBm: this.customerDetails.KycClassification.idProofRatingVerifiedByBm,
      //   addressProofRatingVerifiedBm: this.customerDetails.KycClassification.addressProofRatingVerifiedBm,
      //   kycStatusFromBm: this.customerDetails.KycClassification.kycStatusFromBm,
      //   reasonFromBm: this.customerDetails.KycClassification.reasonFromBm
      // })
    }
  }

  initForm() {
    this.custClassificationForm = this.fb.group({
      customerId: [this.customerDetails.customerId, [Validators.required]],
      customerKycId: [this.customerDetails.customerKycId, [Validators.required]],
      behaviourRatingCce: ['', [Validators.required]],
      idProofRatingCce: ['', [Validators.required]],
      addressProofRatingCce: ['', [Validators.required]],
      kycStatusFromCce: ['', [Validators.required]],
      reasonFromCce: [],
      behaviourRatingVerifiedByBm: [false, [Validators.required]],
      idProofRatingVerifiedByBm: [false, [Validators.required]],
      addressProofRatingVerifiedBm: [false, [Validators.required]],
      kycStatusFromBm: ['', [Validators.required]],
      reasonFromBm: []
    })

    if (this.role == 'Customer Care Executive') {
      // this.custClassificationForm.disable()
      this.custClassificationForm.controls.behaviourRatingVerifiedByBm.disable();
      this.custClassificationForm.controls.idProofRatingVerifiedByBm.disable();
      this.custClassificationForm.controls.addressProofRatingVerifiedBm.disable();
      this.custClassificationForm.controls.kycStatusFromBm.disable();
      this.custClassificationForm.controls.reasonFromBm.disable();
    } else {
      this.custClassificationForm.controls.behaviourRatingCce.disable();
      this.custClassificationForm.controls.idProofRatingCce.disable();
      this.custClassificationForm.controls.addressProofRatingCce.disable();
      this.custClassificationForm.controls.kycStatusFromCce.disable();
      this.custClassificationForm.controls.reasonFromCce.disable();
    }

    // this.custClassificationFormBM = this.fb.group({
    //   customerId: [this.customerDetails.customerId, [Validators.required]],
    //   customerKycId: [this.customerDetails.customerKycId, [Validators.required]],
    //   behaviourRatingVerifiedByBm: [false, [Validators.required]],
    //   idProofRatingVerifiedByBm: [false, [Validators.required]],
    //   addressProofRatingVerifiedBm: [false, [Validators.required]],
    //   kycStatusFromBm: ['', [Validators.required]],
    //   reasonFromBm: []
    // })
  }

  conditionalValidation() {
    this.custClassificationForm.get('kycStatusFromCce').valueChanges.subscribe(res => {
      if (res == 'pending') {
        this.custClassificationForm.get('reasonFromCce').setValidators(Validators.required);
        this.showTextBoxCce = true;
      } else if (res == 'approved') {
        this.custClassificationForm.get('reasonFromCce').clearValidators();
        this.custClassificationForm.get('reasonFromCce').patchValue('');
        this.showTextBoxCce = false;
      }
      this.custClassificationForm.get('reasonFromCce').updateValueAndValidity();
    })

    // Validation for BM
    this.custClassificationForm.get('kycStatusFromBm').valueChanges.subscribe(res => {
      if (res == 'rejected') {
        this.custClassificationForm.get('reasonFromBm').setValidators(Validators.required);
        this.showTextBoxBM = true;
      } else if (res == 'approved') {
        this.custClassificationForm.get('reasonFromBm').clearValidators();
        this.custClassificationForm.get('reasonFromBm').patchValue('');
        this.showTextBoxBM = false;
      }
      this.custClassificationForm.get('reasonFromBm').updateValueAndValidity();
    })
  }

  getRating() {
    this.custClassificationService.getRating().pipe(
      map(res => {
        this.rating = res;
      })
    ).subscribe()
  }

  submit() {

    if (this.custClassificationForm.invalid) {
      this.custClassificationForm.markAllAsTouched();
      return;
    }

    console.log(this.custClassificationForm.value)

    this.custClassificationForm.patchValue({
      behaviourRatingCce: +(this.custClassificationForm.get('behaviourRatingCce').value),
      idProofRatingCce: +(this.custClassificationForm.get('idProofRatingCce').value),
      addressProofRatingCce: +(this.custClassificationForm.get('addressProofRatingCce').value),
    })

    if (this.editRating) {
      this.custClassificationService.updateCceRating(this.custClassificationForm.value).pipe(
        map(res => {
          if (res) {
            this.toastr.success(res.message);
            this.next.emit(true);
          }
        })
      ).subscribe();
    } else {
      this.custClassificationService.cceRating(this.custClassificationForm.value).pipe(
        map(res => {
          if (res) {
            this.toastr.success(res.message);
            this.next.emit(true);
          }
        })
      ).subscribe();
    }

  }

  get cceControls() {
    return this.custClassificationForm.controls;
  }

}
