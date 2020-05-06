import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { UserAddressService, UserBankService, UserPersonalService } from '../../../../../core/kyc-settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { map, filter, finalize, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

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
        "gender": "f",
        "martialStatus": "married",
        "occupationId": { id: 1, name: 'B.E' }, // occupation.name
        "identityType": { id: 1, name: "passport" },  //identityType.name
        "identityProof": [
          "http://173.249.49.7:8000/uploads/images/1588052018310.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
        ],
        "identityProofNumber": "asd432asd",
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
          "state": { id: 1, name: "Andaman and Nicobar Islands" }, // state.name
          "city": { id: 3, name: "Port Blair" }, // city.name
          "pinCode": 122121,
          "addressProof": [
            "http://173.249.49.7:8000/uploads/images/1588052060956.png",
            "http://173.249.49.7:8000/uploads/images/1588052086540.png"
          ],
          "createdAt": "2020-04-28T05:35:06.709Z",
          "updatedAt": "2020-04-28T05:35:06.709Z",
          "addressProofTypeId": { id: 4, name: "voter Id" }, // addressProofType.name
          "addressProofNumber": "qwewq123"
        },
        {
          "id": 2,
          "customerKycId": 1,
          "customerId": 1,
          "addressType": "residential",
          "address": "assa1212",
          "state": { id: 5, name: "Bihar" },
          "city": { id: 448, name: "Amarpur" },
          "pinCode": 122121,
          "addressProof": [
            "http://173.249.49.7:8000/uploads/images/1588052060956.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
          ],
          "createdAt": "2020-04-28T05:35:06.709Z",
          "updatedAt": "2020-04-28T05:35:06.709Z",
          "addressProofTypeId": { id: 6, name: "aadhar card" },
          "addressProofNumber": "qwewq123"
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
          "accountNumber": "123467126876872137",
          "ifscCode": "bkid1233123",
          "passbookProof": [
            "http://173.249.49.7:8000/uploads/images/1588052315608.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
          ],
          "createdAt": "2020-04-28T05:44:52.576Z",
          "updatedAt": "2020-04-28T05:44:52.576Z"
        }
      ]
    },
    "customerId": 1,
    "customerKycId": 1
  }
  file: any;
  occupations = [];

  // data: any = {};

  constructor(private userAddressService:
    UserAddressService, private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private userBankService: UserBankService,
    private toastr: ToastrService,
    private userPersonalService: UserPersonalService) { }

  ngOnInit() {
    console.log(this.data)
    // this.data = this.userBankService.kycDetails;
    this.initForm();
    this.getStates();
    this.getIdentityType();
    this.getAddressProofType();
    this.getOccupation();
    // this.getCities();
    // this.submit()
  }

  initForm() {
    this.reviewForm = this.fb.group({
      profileImage: [this.data.customerKycReview.customerKyc.profileImage, [Validators.required]],
      firstName: [this.data.customerKycReview.firstName, [Validators.required]],
      lastName: [this.data.customerKycReview.lastName, [Validators.required]],
      mobileNumber: [this.data.customerKycReview.mobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: [this.data.customerKycReview.panCardNumber, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      identityTypeId: [this.data.customerKycReview.customerKyc.identityType.id, [Validators.required]],
      identityProof: [this.data.customerKycReview.customerKyc.identityProof, [Validators.required]],
      identityProofNumber: [this.data.customerKycReview.customerKyc.identityProofNumber, [Validators.required]],
    })
    this.customerKycAddressOne = this.fb.group({
      id: this.data.customerKycReview.customerKycAddress[0].id,
      customerKycId: this.data.customerKycReview.customerKycAddress[0].customerKycId,
      customerId: this.data.customerKycReview.customerKycAddress[0].customerId,
      addressType: [this.data.customerKycReview.customerKycAddress[0].addressType, [Validators.required]],
      address: [this.data.customerKycReview.customerKycAddress[0].address, [Validators.required]],
      stateId: [this.data.customerKycReview.customerKycAddress[0].city.id, [Validators.required]],
      cityId: [this.data.customerKycReview.customerKycAddress[0].city.id, [Validators.required]],
      pinCode: [this.data.customerKycReview.customerKycAddress[0].pinCode, [Validators.required]],
      addressProof: [this.data.customerKycReview.customerKycAddress[0].addressProof, [Validators.required]],
      addressProofTypeId: [this.data.customerKycReview.customerKycAddress[0].addressProofTypeId.id, [Validators.required]],
      addressProofNumber: [this.data.customerKycReview.customerKycAddress[0].addressProofNumber, [Validators.required]],

    })
    this.customerKycAddressTwo = this.fb.group({
      id: this.data.customerKycReview.customerKycAddress[1].id,
      customerKycId: this.data.customerKycReview.customerKycAddress[1].customerKycId,
      customerId: this.data.customerKycReview.customerKycAddress[1].customerId,
      addressType: [this.data.customerKycReview.customerKycAddress[1].addressType, [Validators.required]],
      address: [this.data.customerKycReview.customerKycAddress[1].address, [Validators.required]],
      stateId: [this.data.customerKycReview.customerKycAddress[1].state.id, [Validators.required]],
      cityId: [this.data.customerKycReview.customerKycAddress[1].city.id, [Validators.required]],
      pinCode: [this.data.customerKycReview.customerKycAddress[1].pinCode, [Validators.required]],
      addressProof: [this.data.customerKycReview.customerKycAddress[1].addressProof, [Validators.required]],
      addressProofTypeId: [this.data.customerKycReview.customerKycAddress[0].addressProofTypeId.id, [Validators.required]],
      addressProofNumber: [this.data.customerKycReview.customerKycAddress[0].addressProofNumber, [Validators.required]],
    }),
      this.customerKyc = this.fb.group({
        profileImage: [this.data.customerKycReview.customerKyc.profileImage, [Validators.required]],
        alternateMobileNumber: [this.data.customerKycReview.customerKyc.alternateMobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        gender: [this.data.customerKycReview.customerKyc.gender, [Validators.required]],
        spouseName: [this.data.customerKycReview.customerKyc.spouseName, [Validators.required]],
        martialStatus: [this.data.customerKycReview.customerKyc.martialStatus, [Validators.required]],
        signatureProof: [this.data.customerKycReview.customerKyc.signatureProof, [Validators.required]],
        occupationId: [this.data.customerKycReview.customerKyc.occupationId.id, [Validators.required]],
        dateOfBirth: [this.data.customerKycReview.customerKyc.dateOfBirth, [Validators.required]],
        identityTypeId: [this.data.customerKycReview.customerKyc.identityType.id, [Validators.required]],
        identityProof: [this.data.customerKycReview.customerKyc.identityProof, [Validators.required]],
        identityProofNumber: [this.data.customerKycReview.customerKyc.identityProofNumber, [Validators.required]],
      }),

      this.customerKycBank = this.fb.group({
        id: this.data.customerKycReview.customerKycBank[0].id,
        customerKycId: this.data.customerKycReview.customerKycBank[0].customerKycId,
        customerId: this.data.customerKycReview.customerKycBank[0].customerId,
        bankName: [this.data.customerKycReview.customerKycBank[0].bankName, [Validators.required]],
        bankBranchName: [this.data.customerKycReview.customerKycBank[0].bankBranchName, [Validators.required]],
        accountType: [this.data.customerKycReview.customerKycBank[0].accountType, [Validators.required]],
        accountHolderName: [this.data.customerKycReview.customerKycBank[0].accountHolderName, [Validators.required]],
        accountNumber: [this.data.customerKycReview.customerKycBank[0].accountNumber, [Validators.required]],
        ifscCode: [this.data.customerKycReview.customerKycBank[0].ifscCode, [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
        passbookProof: [this.data.customerKycReview.customerKycBank[0].passbookProof, [Validators.required]]
      })



    // this.reviewForm.disable();
    // this.customerKycAddressOne.disable();
    // this.customerKycAddressTwo.disable();
    // this.customerKycBank.disable();
    // this.customerKyc.disable();

    this.customerKycAddressOne.patchValue({ stateId: this.customerKycAddressOne.controls.stateId.value, cityId: this.customerKycAddressOne.controls.cityId.value });
    this.customerKycAddressOne.patchValue({ stateId: this.customerKycAddressTwo.controls.stateId.value, cityId: this.customerKycAddressTwo.controls.cityId.value });

    this.ref.detectChanges()
  }

  submit() {
    // console.log(this.customerKyc.value, this.customerKycBank.value, this.customerKycAddressOne.value, this.customerKycAddressTwo.value)

    // FINAL OBJ {customerKyc: {}, customerKycBank: [], customerKycAddress: []}

    this.customerKyc.patchValue({
      identityTypeId: this.reviewForm.get('identityTypeId').value,
      identityProofNumber: this.reviewForm.get('identityProofNumber').value,
    })

    let customerKycAddress = [];
    customerKycAddress.push(this.customerKycAddressOne.value, this.customerKycAddressTwo.value);

    let customerKycBank = [];
    customerKycBank.push(this.customerKycBank.value);

    const data = {
      customerId: this.data.customerId,
      customerKycId: this.data.customerKycId,
      customerKyc: this.customerKyc.value,
      customerKycAddress: customerKycAddress,
      customerKycBank: customerKycBank
    }
    console.log(data)

    if (this.customerKyc.invalid || this.customerKycAddressOne.invalid || this.customerKycAddressTwo.invalid || this.customerKycBank.invalid) {
      this.customerKyc.markAllAsTouched();
      this.customerKycAddressOne.markAllAsTouched();
      this.customerKycAddressTwo.markAllAsTouched();
      this.customerKycBank.markAllAsTouched();
      return;
    }

    this.userBankService.kycSubmit(data).pipe(
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

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
      this.ref.detectChanges();
    });
    // if (this.customerKycAddressOne.controls.addressType.value == 'permanent') {
    this.getCities('permanent');
    // } else if (this.customerKycAddressTwo.controls.addressType.value == 'residential') {
    this.getCities('residential');
    // }

    // this.customerKycAddressOne.patchValue({ stateId: this.customerKycAddressOne.controls.stateId.value, cityId: this.customerKycAddressOne.controls.cityId.value });
    // this.customerKycAddressOne.patchValue({ stateId: this.customerKycAddressTwo.controls.stateId.value, cityId: this.customerKycAddressTwo.controls.cityId.value });
  }

  getCities(type?) {
    console.log(type)
    let stateId = null;
    if (type == 'permanent') {
      stateId = this.customerKycAddressOne.controls.stateId.value;
    } else if (type == 'residential') {
      stateId = this.customerKycAddressTwo.controls.stateId.value;
    }
    // console.log(stateId)
    this.sharedService.getCities(stateId).subscribe(res => {
      if (type == 'permanent') {
        this.cities0 = res.message;
        this.ref.detectChanges();

      } else if (type == 'residential') {
        this.cities1 = res.message;
        this.ref.detectChanges();

      }
    });

    // this.customerKycAddressOne.patchValue({ stateId: this.customerKycAddressOne.controls.stateId.value, cityId: this.customerKycAddressOne.controls.cityId.value });
    // this.customerKycAddressOne.patchValue({ stateId: this.customerKycAddressTwo.controls.stateId.value, cityId: this.customerKycAddressTwo.controls.cityId.value });  
  }

  getOccupation() {
    this.userPersonalService.getOccupation().subscribe(res => {
      this.occupations = res;
    }, err => {
      // console.log(err);
    })
  }

  removeImages(index, type) {
    // console.log(index, type)
    if (type == 'identityProof') {
      this.data.customerKycReview.customerKyc.identityProof.splice(index, 1)
    } else if (type == 'residential') {
      this.data.customerKycReview.customerKycAddress[1].addressProof.splice(index, 1)
    } else if (type == 'permanent') {
      this.data.customerKycReview.customerKycAddress[0].addressProof.splice(index, 1)
    } else if (type == 'passbook') {
      this.data.customerKycReview.customerKycBank[0].passbookProof.splice(index, 1)
    }
  }

  getFileInfo(event, type: any) {
    this.file = event.target.files[0];
    // console.log(type);
    // console.log(this.addressControls)
    this.sharedService.uploadFile(this.file).pipe(
      map(res => {
        if (type == "profile") {
          this.data.customerKycReview.customerKyc.profileImage = res.uploadFile.URL;
          this.customerKyc.patchValue({ profileImage: res.uploadFile.URL })
          this.ref.markForCheck();
        }
        if (type == "identityProof") {
          this.data.customerKycReview.customerKyc.identityProof.push(res.uploadFile.URL)
          this.customerKyc.patchValue({ identityProof: this.data.customerKycReview.customerKyc.identityProof })

        }
        if (type == 'permanent') {
          this.data.customerKycReview.customerKycAddress[0].addressProof.push(res.uploadFile.URL)
          this.customerKycAddressOne.patchValue({ addressProof: this.data.customerKycReview.customerKycAddress[0].addressProof })
        }
        if (type == 'residential') {
          this.data.customerKycReview.customerKycAddress[1].addressProof.push(res.uploadFile.URL)
          this.customerKycAddressTwo.patchValue({ addressProof: this.data.customerKycReview.customerKycAddress[1].addressProof })
          console.log(this.customerKyc.value)
        }
        if (type == "signature") {
          this.data.customerKycReview.customerKyc.signatureProof = res.uploadFile.URL;
          this.customerKyc.patchValue({ signatureproof: res.uploadFile.URL })
          console.log(this.customerKyc.value)
          this.ref.markForCheck();
        }
        if (type == 'passbook') {
          this.data.customerKycReview.customerKycBank[0].passbookProof.push(res.uploadFile.URL)
          this.customerKycBank.patchValue({ passbook: this.data.customerKycReview.customerKycBank[0].passbookProof })
        }
        this.ref.detectChanges();
        // console.log(this.addressControls)
      }), catchError(err => {
        this.toastr.error(err.error.message);
        throw err
      })).subscribe()

  }

  get controls() {
    return this.reviewForm.controls;
  }

}
