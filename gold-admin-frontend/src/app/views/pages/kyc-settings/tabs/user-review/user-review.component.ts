import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { UserAddressService } from '../../../../../core/kyc-settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';

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
  customerKycAddressOne:FormGroup
  customerKycAddressTwo:FormGroup
  states = [];
  cities0 = [];
  cities1 = [];
  data = {
    "customerKycReview": {
      "id": 1,
      "customerUniqueId": null,
      "firstName": "bhushan",
      "lastName": "madaye",
      "mobileNumber": "8424004296",
      "email": "nimap@infotech.com",
      "panCardNumber": "asass1234a",
      "stageId": 1,
      "statusId": 1,
      "stateId": 1,
      "cityId": 1,
      "kycStatus": "pending",
      "isKycSubmitted": false,
      "isVerifiedByCce": false,
      "cceVerifiedBy": null,
      "isVerifiedByBranchManager": false,
      "branchManagerVerifiedBy": null,
      "isActive": true,
      "createdBy": 36,
      "modifiedBy": 36,
      "lastLogin": null,
      "createdAt": "2020-04-28T05:31:32.245Z",
      "updatedAt": "2020-04-28T05:31:32.245Z",
      "customerKyc": {
        "id": 1,
        "customerId": 1,
        "profileImage": "http://173.249.49.7:8000/uploads/images/1588052119361.png",
        "firstName": "bhushan",
        "lastName": "madaye",
        "dateOfBirth": "2020-04-08T18:30:00.000Z",
        "alternateMobileNumber": "1232132132",
        "panCardNumber": "asass1234a",
        "gender": "m",
        "martialStatus": "married",
        "occupationId": 1,
        "identityTypeId": 1,
        "identityProof": [
          "http://173.249.49.7:8000/uploads/images/1588052018310.png"
        ],
        "spouseName": "asd",
        "signatureProof": "http://173.249.49.7:8000/uploads/images/1588052173393.png",
        "createdBy": 36,
        "modifiedBy": 36,
        "isActive": false,
        "createdAt": "2020-04-28T05:33:23.145Z",
        "updatedAt": "2020-04-28T05:36:22.176Z"
      },
      "customerKycAddress": [
        {
          "id": 1,
          "customerKycId": 1,
          "customerId": 1,
          "addressType": "permanent",
          "address": "assa1212",
          "stateId": 1,
          "cityId": 1,
          "pinCode": 122121,
          "addressProof": [
            "http://173.249.49.7:8000/uploads/images/1588052060956.png",
            "http://173.249.49.7:8000/uploads/images/1588052086540.png"
          ],
          "createdAt": "2020-04-28T05:35:06.709Z",
          "updatedAt": "2020-04-28T05:35:06.709Z",
          "addressProofTypeId": 1
        },
        {
          "id": 2,
          "customerKycId": 1,
          "customerId": 1,
          "addressType": "residential",
          "address": "assa1212",
          "stateId": 1,
          "cityId": 1,
          "pinCode": 122121,
          "addressProof": [
            "http://173.249.49.7:8000/uploads/images/1588052060956.png",
            "http://173.249.49.7:8000/uploads/images/1588052086540.png"
          ],
          "createdAt": "2020-04-28T05:35:06.709Z",
          "updatedAt": "2020-04-28T05:35:06.709Z",
          "addressProofTypeId": 1
        }
      ],
      "customerKycBank": [
        {
          "id": 4,
          "customerKycId": 1,
          "customerId": 1,
          "bankName": "nkgsb",
          "bankBranchName": "virar",
          "accountType": "saving",
          "accountHolderName": "bhushan",
          "accountNumber": "1234671268768721376",
          "ifscCode": "bkid1233123",
          "passbookProof": [
            "http://173.249.49.7:8000/uploads/images/1588052315608.png"
          ],
          "createdAt": "2020-04-28T05:44:52.576Z",
          "updatedAt": "2020-04-28T05:44:52.576Z"
        }
      ]
    },
    "customerId": 1,
    "customerKycId": 1
  }
  constructor(private userAddressService:
    UserAddressService, private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.reviewForm = this.fb.group({
      profileImage: [this.data.customerKycReview.customerKyc.profileImage, [Validators.required]],
      firstName: [this.data.customerKycReview.firstName, [Validators.required]],
      lastName: [this.data.customerKycReview.lastName, [Validators.required]],
      mobileNumber: [this.data.customerKycReview.mobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: [this.data.customerKycReview.panCardNumber, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      //
    })
      this.customerKycAddressOne = this.fb.group({
          identityTypeId: ['', [Validators.required]],
          identityProof: ['', [Validators.required]],
          addressType: [],
          address: [],
          stateId: [],
          cityId: [],
          pinCode: [],
          addressProof: [],
        })
        this.customerKycAddressTwo = this.fb.group({
          identityTypeId: ['', [Validators.required]],
          identityProof: ['', [Validators.required]],
          addressType: [],
          address: [],
          stateId: [],
          cityId: [],
          pinCode: [],
          addressProof: [],
          //   }),
        }),
      this.customerKyc = this.fb.group({
        alternateMobileNumber: [this.data.customerKycReview.customerKyc.alternateMobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        gender: [this.data.customerKycReview.customerKyc.gender, [Validators.required]],
        spouseName: [this.data.customerKycReview.customerKyc.gender, [Validators.required]],
        martialStatus: [this.data.customerKycReview.customerKyc.martialStatus, [Validators.required]],
        signatureProof: [this.data.customerKycReview.customerKyc.signatureProof, [Validators.required]],
        occupationId: [this.data.customerKycReview.customerKyc.occupationId, [Validators.required]],
        dateOfBirth: [this.data.customerKycReview.customerKyc.dateOfBirth, [Validators.required]],
      }),

      this.customerKycBank = this.fb.group({
        bankName: [this.data.customerKycReview.customerKycBank[0].bankName, [Validators.required]],
        bankBranchName: [this.data.customerKycReview.customerKycBank[0].bankBranchName, [Validators.required]],
        accountType: [this.data.customerKycReview.customerKycBank[0].accountType, [Validators.required]],
        accountHolderName: [this.data.customerKycReview.customerKycBank[0].accountHolderName, [Validators.required]],
        accountNumber: [this.data.customerKycReview.customerKycBank[0].accountNumber, [Validators.required]],
        ifscCode: [this.data.customerKycReview.customerKycBank[0].ifscCode, [Validators.required]],
        passbookProof: [this.data.customerKycReview.customerKycBank[0].passbookProof]
      })
   
    console.log(this.customerKycBank.value)
    this.ref.detectChanges()
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
