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
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'kt-user-classification',
  templateUrl: './user-classification.component.html',
  styleUrls: ['./user-classification.component.scss'],
  providers: [TitleCasePipe]
})
export class UserClassificationComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  cceKycStatus = [{ value: 'pending', name: 'pending' }, { value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }];
  bmKycStatus = [{ value: 'incomplete', name: 'incomplete' }, { value: 'approved', name: 'approved' }, { value: 'rejected', name: 'rejected' }];

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
  permission: any;

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
    private ref: ChangeDetectorRef,
    private permissionService: NgxPermissionsService,
    private router: Router
  ) {
    this.permissionService.permissions$.subscribe(res => {
      this.permission = res
      if (!(this.permission.cceKycRating || this.permission.opsKycRating)) {
        return this.router.navigate(['/admin/lead-management'])
      }
    })

    let res = this.sharedService.getDataFromStorage()
    this.userType = res.userDetails.userTypeId;

    this.getRating();
    this.getReasonsList();
  }

  ngOnInit() {


    if (this.userBankService.kycDetails) {
      if (this.userBankService.kycDetails.KycClassification !== null) {
        this.customerDetails = this.userBankService.kycDetails.KycClassification
        this.customerDetails.ratingStage = this.userBankService.kycDetails.ratingStage
        this.customerDetails.moduleId = this.userBankService.kycDetails.moduleId
        this.customerDetails.userType = this.userBankService.kycDetails.userType
      } else {
        this.customerDetails.ratingStage = this.userBankService.kycDetails.ratingStage
        this.customerDetails.moduleId = this.userBankService.kycDetails.moduleId
        this.customerDetails.userType = this.userBankService.kycDetails.userType
      }
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
      // console.log(this.customerDetails)

      if (this.customerDetails.moduleId == 3) {
        this.customerDetails.kycRatingFromCce = this.customerDetails.scrapKycRatingFromCce
        this.customerDetails.kycStatusFromCce = this.customerDetails.scrapKycStatusFromCce
        this.customerDetails.reasonFromCce = this.customerDetails.scrapReasonFromCce
        this.customerDetails.kycStatusFromOperationalTeam = this.customerDetails.scrapKycStatusFromOperationalTeam
        this.customerDetails.reasonFromOperationalTeam = this.customerDetails.scrapReasonFromOperationalTeam
      }

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
      kycStatusFromCce: [, [Validators.required]],
      reasonFromCce: [],
      reasonForOther: [],
      kycStatusFromOperationalTeam: ['pending', [Validators.required]],
      reasonFromOperationalTeam: [''],
      moduleId: [this.customerDetails.moduleId],
      userType: [this.customerDetails.userType]
    })

    if (this.permission.cceKycRating && !this.permission.opsKycRating && this.customerDetails.ratingStage == 1) {
      this.custClassificationForm.controls.kycRatingFromBM.disable();
      this.custClassificationForm.controls.kycStatusFromOperationalTeam.disable();
      this.custClassificationForm.controls.reasonFromOperationalTeam.disable();
      this.viewBMForm = false;
    } else if (this.permission.opsKycRating && !this.permission.cceKycRating && this.customerDetails.ratingStage == 2) {
      this.custClassificationForm.controls.kycRatingFromCce.disable();
      this.custClassificationForm.controls.kycStatusFromCce.disable();
      this.custClassificationForm.controls.reasonFromCce.disable();
      this.custClassificationForm.controls.reasonForOther.disable();
    } else if (this.permission.cceKycRating && this.permission.opsKycRating && this.customerDetails.ratingStage == 2) {
      this.custClassificationForm.controls.kycRatingFromCce.disable();
      this.custClassificationForm.controls.kycStatusFromCce.disable();
      this.custClassificationForm.controls.reasonFromCce.disable();
      this.custClassificationForm.controls.reasonForOther.disable();
    } else if (this.permission.cceKycRating && this.permission.opsKycRating && this.customerDetails.ratingStage == 1) {
      this.custClassificationForm.controls.kycRatingFromBM.disable();
      this.custClassificationForm.controls.kycStatusFromOperationalTeam.disable();
      this.custClassificationForm.controls.reasonFromOperationalTeam.disable();
    }
    else if (this.permission.cceKycRating && this.permission.opsKycRating && !this.customerDetails) {
      this.custClassificationForm.controls.kycRatingFromBM.disable();
      this.custClassificationForm.controls.kycStatusFromOperationalTeam.disable();
      this.custClassificationForm.controls.reasonFromOperationalTeam.disable();
    }
    else {
      // this.custClassificationForm.disable()
    }
  }

  conditionalValidation() {
    if ((this.custClassificationForm.controls.kycRatingFromCce.value == '5' || this.custClassificationForm.controls.kycRatingFromCce.value == '4') && this.custClassificationForm.controls.kycStatusFromCce.value == 'approved') {
      this.custClassificationForm.get('reasonForOther').setValidators([]);
      this.custClassificationForm.get('reasonForOther').updateValueAndValidity();
      this.custClassificationForm.get('reasonForOther').patchValue('');

      this.custClassificationForm.get('reasonFromCce').setValidators([]);
      this.custClassificationForm.get('reasonFromCce').updateValueAndValidity();
      this.custClassificationForm.get('reasonFromCce').patchValue('');
      this.showTextBoxCce = false;
    } else {
      this.custClassificationForm.get('reasonForOther').reset();
      this.custClassificationForm.get('reasonForOther').patchValue(null);
      this.custClassificationForm.get('reasonForOther').setValidators(Validators.required);
      this.custClassificationForm.get('reasonForOther').updateValueAndValidity();
      this.showTextBoxCce = true;
    }
    this.custClassificationForm.get('reasonForOther').updateValueAndValidity();
    // }

    // Validation for BM
    this.custClassificationForm.get('kycStatusFromOperationalTeam').valueChanges.subscribe(res => {
      if (res == 'approved') {
        this.custClassificationForm.get('reasonFromOperationalTeam').setValidators([]);
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
        // console.log(res)
        this.reasons = res.data;
      })
    ).subscribe()
  }

  submit() {
    if (this.custClassificationForm.invalid) {
      this.custClassificationForm.markAllAsTouched();
      // if (this.custClassificationForm.controls.reasonFromCce.invalid) {
      //   this.custClassificationForm.controls.reasonFromCce.setErrors({ 'reasonRequired': true })
      // }
      return;
    }
    // return
    // console.log(this.custClassificationForm.value)

    this.custClassificationForm.patchValue({
      behaviourRatingCce: +(this.custClassificationForm.get('kycRatingFromCce').value),
    })

    if (this.customerDetails.ratingStage === 2) {
      const otDataScrap = {
        customerId: this.customerDetails.customerId,
        customerKycId: this.customerDetails.customerKycId,
        moduleId: this.custClassificationForm.controls.moduleId.value,
        userType: this.custClassificationForm.controls.userType.value,
        scrapKycStatusFromOperationalTeam: this.custClassificationForm.controls.kycStatusFromOperationalTeam.value,
        scrapReasonFromOperationalTeam: this.custClassificationForm.controls.reasonFromOperationalTeam.value
      }

      const otData = this.customerDetails.moduleId == 3 ? otDataScrap : this.custClassificationForm.value

      this.custClassificationService.opsTeamRating(otData).pipe(
        map(res => {
          if (res) {
            this.toastr.success(this.titlecase.transform(res.message));
            // this.next.emit(true);
            if (this.permission.opsKycRating && (otData.scrapKycStatusFromOperationalTeam == 'approved' || otData.kycStatusFromOperationalTeam == 'approved')) {
              this.route.navigate(['/admin/lead-management/new-requests']);
              // this.userDetailsService.userData = {}
            } else {
              this.route.navigate(['/admin/applied-kyc']);
            }
          }
        })
      ).subscribe();
    } else {
      const cceDataScrap = {
        customerId: this.customerDetails.customerId,
        customerKycId: this.customerDetails.customerKycId,
        moduleId: this.custClassificationForm.controls.moduleId.value,
        userType: this.custClassificationForm.controls.userType.value,
        scrapKycRatingFromCce: Number(this.custClassificationForm.controls.kycRatingFromCce.value),
        scrapKycStatusFromCce: this.custClassificationForm.controls.kycStatusFromCce.value,
        scrapReasonFromCce: this.custClassificationForm.controls.reasonFromCce.value
      }

      const cceData = this.customerDetails.moduleId == 3 ? cceDataScrap : this.custClassificationForm.value
      this.custClassificationService.cceRating(cceData).pipe(
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
    if (this.permission.opsKycRating) {
      if (type == 'kycRating') {
        this.cceControls.kycRatingFromBM.patchValue(value)
      }
    }
  }

  patchReason() {
    // if (this.cceControls.reasonForOther.value != "Other") {
    //   this.cceControls.reasonFromCce.patchValue(this.cceControls.reasonForOther.value)

    // } else {
    //   this.cceControls.reasonFromCce.reset()
    // }

    if (this.cceControls.reasonForOther.value != "Other") {
      this.cceControls.reasonFromCce.patchValue(this.cceControls.reasonForOther.value)
      this.cceControls.reasonFromCce.setValidators([])
      this.cceControls.reasonFromCce.updateValueAndValidity()
    } else {
      this.cceControls.reasonFromCce.setValidators([Validators.required])
      this.cceControls.reasonFromCce.updateValueAndValidity()
      this.cceControls.reasonFromCce.reset()
      // this.cceControls.reasonFromCce.patchValue(this.cceControls.reasonForOther.value)
    }
  }

  resetKYCStatus() {
    this.cceControls.kycStatusFromCce.patchValue(null)
    this.cceControls.kycStatusFromCce.markAsUntouched()
  }
}
