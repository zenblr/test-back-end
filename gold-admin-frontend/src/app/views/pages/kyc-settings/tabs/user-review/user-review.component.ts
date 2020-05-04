import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { UserAddressService, UserBankService } from '../../../../../core/kyc-settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { map, filter, finalize } from 'rxjs/operators';

@Component({
  selector: 'kt-user-review',
  templateUrl: './user-review.component.html',
  styleUrls: ['./user-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserReviewComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  identityProofs = [];
  addressProofs = [];
  customerKycBank: FormGroup
  customerKyc: FormGroup
  reviewForm: FormGroup;
  customerKycAddressOne: FormGroup
  customerKycAddressTwo: FormGroup
  states = [];
  cities0 = [];
  cities1 = [];
  // data = {
  //   "customerKycReview": {
  //     "id": 1,
  //     "customerUniqueId": null,
  //     "firstName": "bhushan",
  //     "lastName": "madaye",
  //     "mobileNumber": "8424004296",
  //     "email": "nimap@infotech.com",
  //     "panCardNumber": "asass1234a",
  //     "stageId": 1,
  //     "statusId": 1,
  //     "stateId": 1,
  //     "cityId": 1,
  //     "kycStatus": "pending",
  //     "isKycSubmitted": false,
  //     "isVerifiedByCce": false,
  //     "cceVerifiedBy": null,
  //     "isVerifiedByBranchManager": false,
  //     "branchManagerVerifiedBy": null,
  //     "isActive": true,
  //     "createdBy": 36,
  //     "modifiedBy": 36,
  //     "lastLogin": null,
  //     "createdAt": "2020-04-28T05:31:32.245Z",
  //     "updatedAt": "2020-04-28T05:31:32.245Z",
  //     "customerKyc": {
  //       "id": 1,
  //       "customerId": 1,
  //       "profileImage": "http://173.249.49.7:8000/uploads/images/1588052119361.png",
  //       "firstName": "bhushan",
  //       "lastName": "madaye",
  //       "dateOfBirth": "2020-04-08T18:30:00.000Z",
  //       "alternateMobileNumber": "1232132132",
  //       "panCardNumber": "asass1234a",
  //       "gender": "m",
  //       "martialStatus": "married",
  //       "occupation": { name: 'Engineer' }, // occupation.name
  //       "identityType": { name: 'aadhar' },  //identityType.name
  //       "identityProof": [
  //         "http://173.249.49.7:8000/uploads/images/1588052018310.png"
  //       ],
  //       "spouseName": "asd",
  //       "signatureProof": "http://173.249.49.7:8000/uploads/images/1588052173393.png",
  //       "createdBy": 36,
  //       "modifiedBy": 36,
  //       "isActive": false,
  //       "createdAt": "2020-04-28T05:33:23.145Z",
  //       "updatedAt": "2020-04-28T05:36:22.176Z"
  //     },
  //     "customerKycAddress": [
  //       {
  //         "id": 1,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "addressType": "permanent",
  //         "address": "assa1212",
  //         "state": { name: "Goa" }, // state.name
  //         "city": { name: 'panji' }, // city.name
  //         "pinCode": 122121,
  //         "addressProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052060956.png",
  //           "http://173.249.49.7:8000/uploads/images/1588052086540.png"
  //         ],
  //         "createdAt": "2020-04-28T05:35:06.709Z",
  //         "updatedAt": "2020-04-28T05:35:06.709Z",
  //         "addressProofType": { name: 'electricity bill' } // addressProofType.name
  //       },
  //       {
  //         "id": 2,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "addressType": "residential",
  //         "address": "assa1212",
  //         "state": { name: "Goa" },
  //         "city": { name: "panji" },
  //         "pinCode": 122121,
  //         "addressProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052060956.png",
  //         ],
  //         "createdAt": "2020-04-28T05:35:06.709Z",
  //         "updatedAt": "2020-04-28T05:35:06.709Z",
  //         "addressProofTypeId": { name: 'electricity bill' }
  //       }
  //     ],
  //     "customerKycBank": [
  //       {
  //         "id": 4,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "bankName": "nkgsb",
  //         "bankBranchName": "virar",
  //         "accountType": "saving",
  //         "accountHolderName": "bhushan",
  //         "accountNumber": "1234671268768721376",
  //         "ifscCode": "bkid1233123",
  //         "passbookProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052315608.png"
  //         ],
  //         "createdAt": "2020-04-28T05:44:52.576Z",
  //         "updatedAt": "2020-04-28T05:44:52.576Z"
  //       }
  //     ]
  //   },
  //   "customerId": 1,
  //   "customerKycId": 1
  // }

  data: any = {};

  constructor(private userAddressService:
    UserAddressService, private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private userBankService: UserBankService) { }

  ngOnInit() {
    console.log(this.data)
    this.data = this.userBankService.kycDetails;
    this.initForm();
    // this.getStates();
    // this.getCities();
    // this.submit()
  }

  initForm() {
    this.reviewForm = this.fb.group({
      profileImage: [, [Validators.required]],
      firstName: [, [Validators.required]],
      lastName: [, [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: [, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      identityTypeId: [, [Validators.required]],
      identityProof: [, [Validators.required]],
    })
    this.customerKycAddressOne = this.fb.group({

      addressType: [],
      address: [],
      stateId: [],
      cityId: [],
      pinCode: [],
      addressProof: [],
    })
    this.customerKycAddressTwo = this.fb.group({
      addressType: [],
      address: [],
      stateId: [],
      cityId: [],
      pinCode: [],
      addressProof: [],
    }),
      this.customerKyc = this.fb.group({
        alternateMobileNumber: [, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        gender: [, [Validators.required]],
        spouseName: [, [Validators.required]],
        martialStatus: [, [Validators.required]],
        signatureProof: [, [Validators.required]],
        occupationId: [, [Validators.required]],
        dateOfBirth: [, [Validators.required]],
      }),

      this.customerKycBank = this.fb.group({
        bankName: [, [Validators.required]],
        bankBranchName: [, [Validators.required]],
        accountType: [, [Validators.required]],
        accountHolderName: [, [Validators.required]],
        accountNumber: [, [Validators.required]],
        ifscCode: [, [Validators.required]],
        passbookProof: []
      })

    this.reviewForm.disable();
    this.customerKycAddressOne.disable();
    this.customerKycAddressTwo.disable();
    this.customerKycBank.disable();
    this.customerKyc.disable();

    this.ref.detectChanges()
  }

  submit() {
    // 
    this.userBankService.kycSubmit(this.data.customerKycReview.customerId, this.data.customerKycReview.customerKycId).pipe(
      map(res => {
        this.next.emit(true);
      })
    ).subscribe()

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


  get controls() {
    return this.reviewForm.controls;
  }

}
