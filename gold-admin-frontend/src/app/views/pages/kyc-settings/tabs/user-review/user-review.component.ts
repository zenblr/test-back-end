import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { UserAddressService } from '../../../../../core/kyc-settings';
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
        "occupationId": 1, // occupation.name
        "identityTypeId": 1,  //identityType.name
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
          "stateId": 1, // state.name
          "cityId": 4, // city.name
          "pinCode": 122121,
          "addressProof": [
            "http://173.249.49.7:8000/uploads/images/1588052060956.png",
            "http://173.249.49.7:8000/uploads/images/1588052086540.png"
          ],
          "createdAt": "2020-04-28T05:35:06.709Z",
          "updatedAt": "2020-04-28T05:35:06.709Z",
          "addressProofTypeId": 1 // addressProofType.name
        },
        {
          "id": 2,
          "customerKycId": 1,
          "customerId": 1,
          "addressType": "residential",
          "address": "assa1212",
          "stateId": 3,
          "cityId": 299,
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
    this.getStates();
    this.getCities();

  }

  initForm() {
    this.reviewForm = this.fb.group({
      profileImage: [this.data.customerKycReview.customerKyc.profileImage, [Validators.required]],
      firstName: [this.data.customerKycReview.firstName, [Validators.required]],
      lastName: [this.data.customerKycReview.lastName, [Validators.required]],
      mobileNumber: [this.data.customerKycReview.mobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: [this.data.customerKycReview.panCardNumber, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      identityTypeId: [this.data.customerKycReview.customerKyc.identityTypeId, [Validators.required]],
      identityProof: [this.data.customerKycReview.customerKyc.identityProof, [Validators.required]],
    })
    this.customerKycAddressOne = this.fb.group({

      addressType: [],
      address: [this.data.customerKycReview.customerKycAddress[0].address],
      stateId: [this.data.customerKycReview.customerKycAddress[0].stateId],
      cityId: [this.data.customerKycReview.customerKycAddress[0].cityId],
      pinCode: [this.data.customerKycReview.customerKycAddress[0].pinCode],
      addressProof: [this.data.customerKycReview.customerKycAddress[0].addressProof],
    })
    this.customerKycAddressTwo = this.fb.group({
      addressType: [],
      address: [this.data.customerKycReview.customerKycAddress[1].address],
      stateId: [this.data.customerKycReview.customerKycAddress[1].stateId],
      cityId: [this.data.customerKycReview.customerKycAddress[1].cityId],
      pinCode: [this.data.customerKycReview.customerKycAddress[1].pinCode],
      addressProof: [this.data.customerKycReview.customerKycAddress[1].addressProof],
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
    // this.sharedService.getStates().subscribe(res => {
    //   this.states = res.message;
    // });

    // this.data.customerKycReview.customerKycAddress.forEach(element => {

    this.sharedService.getStates().pipe(map(res => {
      for (let index = 0; index < this.data.customerKycReview.customerKycAddress.length; index++) {
        var temp = [];
        temp = res.message.filter(state => {
          return state.id == this.data.customerKycReview.customerKycAddress[index].stateId;
        })
        console.log(temp[0].name)
        if (index == 0) {
          this.customerKycAddressOne.patchValue({ stateId: temp[0].name })
        } else {
          this.customerKycAddressTwo.patchValue({ stateId: temp[0].name })
        }
      }
    }),finalize(()=>{
      this.ref.detectChanges()
    })).subscribe()


    console.log(this.states)
  }

  getCities() {
    for (let index = 0; index < this.data.customerKycReview.customerKycAddress.length; index++) {
      this.sharedService.getCities(this.data.customerKycReview.customerKycAddress[index].stateId).pipe(map(res => {
        var temp = [];
        temp = res.message.filter(city => {
          return city.id == this.data.customerKycReview.customerKycAddress[index].cityId;
        })
        console.log(temp)
        if (index == 0) {
          this.customerKycAddressOne.patchValue({ cityId: temp[0].name })
        } else {
          this.customerKycAddressTwo.patchValue({ cityId: temp[0].name })
        }
      }),finalize(()=>{
        this.ref.detectChanges()
      })).subscribe()
      
    }

    console.log(this.cities0);

  }

  get controls() {
    return this.reviewForm.controls;
  }

}
