import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserAddressService } from '../../../../../core/kyc-settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-user-review',
  templateUrl: './user-review.component.html',
  styleUrls: ['./user-review.component.scss']
})
export class UserReviewComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  identityProofs = [];
  addressProofs = [];
  reviewForm: FormGroup;
  states = [];
  cities0 = [];
  cities1 = [];

  constructor(private userAddressService: UserAddressService, private fb: FormBuilder,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.reviewForm = this.fb.group({
      profileImage: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: ['', [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      customerKycAddress: this.fb.array([
        this.fb.group({
          identityTypeId: ['', [Validators.required]],
          identityProof: ['', [Validators.required]],
          addressType: [],
          address: [],
          stateId: [],
          cityId: [],
          pinCode: [],
          addressProof: [],
        }),
      ]),
      customerKyc: this.fb.group({
        alternateMobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        gender: ['', [Validators.required]],
        spouseName: ['', [Validators.required]],
        martialStatus: ['', [Validators.required]],
        signatureProof: ['', [Validators.required]],
        occupationId: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required]],
      }),
      customerKycBank: this.fb.group({
        bankName: ['', [Validators.required]],
        bankBranchName: ['', [Validators.required]],
        accountType: ['', [Validators.required]],
        accountHolderName: ['', [Validators.required]],
        accountNumber: ['', [Validators.required]],
        ifscCode: ['', [Validators.required]],
        passbookProof: []
      })
    })
  }

  submit() {
    this.next.emit(true);
  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      this.identityProofs = res;
    })
  }

  getAddressProofType() {
    this.userAddressService.getAddressProofType().subscribe(res => {
      this.addressProofs = res;
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    });
  }

  getCities(index) {
    console.log(index)
    // const stateId = this.addressControls.controls[index]['controls'].stateId.value;
    // console.log(stateId)
    // this.sharedService.getCities(stateId).subscribe(res => {
    //   if (index == 0) {
    //     this.cities0 = res.message;
    //   } else {
    //     this.cities0 = res.message;
    //   }
    // });
  }

  get controls() {
    return this.reviewForm.controls;
  }

}
