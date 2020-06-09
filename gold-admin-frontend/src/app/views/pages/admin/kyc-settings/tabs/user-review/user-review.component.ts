import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, Inject, ElementRef } from '@angular/core';
import { UserAddressService, UserBankService, UserPersonalService, UserDetailsService } from '../../../../../../core/kyc-settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, filter, finalize, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AppliedKycService } from '../../../../../../core/applied-kyc/services/applied-kyc.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { WebcamDialogComponent } from '../../webcam-dialog/webcam-dialog.component';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';

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
  customerKycPersonal: FormGroup
  reviewForm: FormGroup;
  customerKycAddressOne: FormGroup
  customerKycAddressTwo: FormGroup
  states = [];
  cities0 = [];
  cities1 = [];
  maxDate = new Date();
  @ViewChild("identity", { static: false }) identity;
  @ViewChild("permanent", { static: false }) permanent;
  @ViewChild("residential", { static: false }) residential;
  @ViewChild("pass", { static: false }) pass;


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
  //     "customerKycPersonal": {
  //       "id": 1,
  //       "customerId": 1,
  //       "profileImage": "http://173.249.49.7:8000/uploads/images/1588052119361.png",
  //       "firstName": "bhushan",
  //       "lastName": "madaye",
  //       "dateOfBirth": "2020-04-08T18:30:00.000Z",
  //       "age": "25",
  //       "alternateMobileNumber": "1232132132",
  //       "panCardNumber": "asass1234a",
  //       "gender": "f",
  //       "martialStatus": "married",
  //       "occupation": { id: 1, name: 'Business' }, // occupation.name
  //       "identityType": { id: 1, name: "passport" },  //identityType.name
  //       "identityProof": [
  //         "http://173.249.49.7:8000/uploads/images/1588052173393.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
  //       ],
  //       "identityProofNumber": "asd432asd",
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
  //         "state": { id: 1, name: "Andaman and Nicobar Islands" }, // state.name
  //         "city": { id: 3, name: "Port Blair" }, // city.name
  //         "pinCode": 122121,
  //         "addressProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052060956.png",
  //           "http://173.249.49.7:8000/uploads/images/1588052086540.png"
  //         ],
  //         "createdAt": "2020-04-28T05:35:06.709Z",
  //         "updatedAt": "2020-04-28T05:35:06.709Z",
  //         "addressProofType": { id: 4, name: "voter Id" }, // addressProofType.name
  //         "addressProofNumber": "qwewq123"
  //       },
  //       {
  //         "id": 2,
  //         "customerKycId": 1,
  //         "customerId": 1,
  //         "addressType": "residential",
  //         "address": "assa1212",
  //         "state": { id: 5, name: "Bihar" },
  //         "city": { id: 454, name: "Bagaha" },
  //         "pinCode": 232323,
  //         "addressProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052060956.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
  //         ],
  //         "createdAt": "2020-04-28T05:35:06.709Z",
  //         "updatedAt": "2020-04-28T05:35:06.709Z",
  //         "addressProofType": { id: 6, name: "aadhar card" },
  //         "addressProofNumber": "qwewq123"
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
  //         "accountNumber": "123467126876872137",
  //         "ifscCode": "bkid1233123",
  //         "passbookProof": [
  //           "http://173.249.49.7:8000/uploads/images/1588052315608.png", "http://173.249.49.7:8000/uploads/images/1588052018310.png"
  //         ],
  //         "createdAt": "2020-04-28T05:44:52.576Z",
  //         "updatedAt": "2020-04-28T05:44:52.576Z"
  //       }
  //     ]
  //   },
  //   "customerId": 1,
  //   "customerKycId": 1
  // }
  file: any;
  occupations = [];

  data: any = {};
  viewOnly = true;
  userType: any;


  constructor(private userAddressService:
    UserAddressService, private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private userBankService: UserBankService,
    private userDetailsService: UserDetailsService,
    private toastr: ToastrService,
    private userPersonalService: UserPersonalService,
    private appliedKycService: AppliedKycService,
    public dialogRef: MatDialogRef<UserReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: any,
    private dialog: MatDialog,
    private ele: ElementRef
  ) {
    let res = this.sharedService.getDataFromStorage();
    this.userType = res.userDetails.userTypeId;

    if (this.modalData.action) {
      console.log(this.data);
      this.viewOnly = false;
    }
  }

  ngOnInit() {
    if (this.userPersonalService.kycDetails) {
      this.data = this.userPersonalService.kycDetails;
    } else
      if (this.userDetailsService.userData) {
        this.data = this.userDetailsService.userData;
      }

    this.appliedKycService.userData$.subscribe(res => {
      if (res) {
        this.data = res;
      }
    })

    this.initForm();
    if (!this.viewOnly || this.userType == 5) {
      this.reviewForm.disable();
      this.customerKycPersonal.disable();
      this.customerKycAddressOne.disable();
      this.customerKycAddressTwo.disable();

    }
    this.getStates();
    this.getIdentityType();
    this.getAddressProofType();
    this.getOccupation();
    // this.getCities();
    // this.submit()
  }

  initForm() {
    this.reviewForm = this.fb.group({
      profileImage: [this.data.customerKycReview.customerKycPersonal.profileImage, [Validators.required]],
      firstName: [this.data.customerKycReview.firstName, [Validators.required]],
      lastName: [this.data.customerKycReview.lastName, [Validators.required]],
      mobileNumber: [this.data.customerKycReview.mobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: [this.data.customerKycReview.panCardNumber, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      identityTypeId: [this.data.customerKycReview.customerKycPersonal.identityType.id, [Validators.required]],
      identityProof: [this.data.customerKycReview.customerKycPersonal.identityProof, [Validators.required]],
      identityProofFileName: [],
      identityProofNumber: [this.data.customerKycReview.customerKycPersonal.identityProofNumber, [Validators.required]],
    })
    this.customerKycAddressOne = this.fb.group({
      id: this.data.customerKycReview.customerKycAddress[0].id,
      customerKycId: this.data.customerKycReview.customerKycAddress[0].customerKycId,
      customerId: this.data.customerKycReview.customerKycAddress[0].customerId,
      addressType: [this.data.customerKycReview.customerKycAddress[0].addressType, [Validators.required]],
      address: [this.data.customerKycReview.customerKycAddress[0].address, [Validators.required]],
      stateId: [this.data.customerKycReview.customerKycAddress[0].state.id, [Validators.required]],
      cityId: [this.data.customerKycReview.customerKycAddress[0].city.id, [Validators.required]],
      pinCode: [this.data.customerKycReview.customerKycAddress[0].pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      addressProof: [this.data.customerKycReview.customerKycAddress[0].addressProof, [Validators.required]],
      addressProofFileName: [],
      addressProofTypeId: [this.data.customerKycReview.customerKycAddress[0].addressProofType.id, [Validators.required]],
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
      pinCode: [this.data.customerKycReview.customerKycAddress[1].pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      addressProof: [this.data.customerKycReview.customerKycAddress[1].addressProof, [Validators.required]],
      addressProofFileName: [],
      addressProofTypeId: [this.data.customerKycReview.customerKycAddress[1].addressProofType.id, [Validators.required]],
      addressProofNumber: [this.data.customerKycReview.customerKycAddress[1].addressProofNumber, [Validators.required]],
    })
    this.customerKycPersonal = this.fb.group({
      profileImage: [this.data.customerKycReview.customerKycPersonal.profileImage, [Validators.required]],
      alternateMobileNumber: [this.data.customerKycReview.customerKycPersonal.alternateMobileNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: [this.data.customerKycReview.customerKycPersonal.gender, [Validators.required]],
      spouseName: [this.data.customerKycReview.customerKycPersonal.spouseName, [Validators.required]],
      martialStatus: [this.data.customerKycReview.customerKycPersonal.martialStatus, [Validators.required]],
      signatureProof: [this.data.customerKycReview.customerKycPersonal.signatureProof],
      signatureProofFileName: [],
      occupationId: [],
      dateOfBirth: [this.data.customerKycReview.customerKycPersonal.dateOfBirth, [Validators.required]],
      age: [this.data.customerKycReview.customerKycPersonal.age, [Validators.required]],
      identityTypeId: [this.data.customerKycReview.customerKycPersonal.identityType.id, [Validators.required]],
      identityProof: [this.data.customerKycReview.customerKycPersonal.identityProof, [Validators.required]],
      identityProofNumber: [this.data.customerKycReview.customerKycPersonal.identityProofNumber, [Validators.required]],

    })

    // this.customerKycBank = this.fb.group({
    //   id: this.data.customerKycReview.customerKycBank[0].id,
    //   customerKycId: this.data.customerKycReview.customerKycBank[0].customerKycId,
    //   customerId: this.data.customerKycReview.customerKycBank[0].customerId,
    //   bankName: [this.data.customerKycReview.customerKycBank[0].bankName, [Validators.required]],
    //   bankBranchName: [this.data.customerKycReview.customerKycBank[0].bankBranchName, [Validators.required]],
    //   accountType: [this.data.customerKycReview.customerKycBank[0].accountType, [Validators.required]],
    //   accountHolderName: [this.data.customerKycReview.customerKycBank[0].accountHolderName, [Validators.required]],
    //   accountNumber: [this.data.customerKycReview.customerKycBank[0].accountNumber, [Validators.required]],
    //   ifscCode: [this.data.customerKycReview.customerKycBank[0].ifscCode, [Validators.required, Validators.pattern('[A-Za-z]{4}[a-zA-Z0-9]{7}')]],
    //   passbookProof: [this.data.customerKycReview.customerKycBank[0].passbookProof, [Validators.required]],
    //   passbookProofFileName: []
    // })

    if (this.data.customerKycReview.customerKycPersonal.occupation !== null) {
      this.customerKycPersonal.get('occupationId').patchValue(this.data.customerKycReview.customerKycPersonal.occupation.id)
    }

    this.ref.detectChanges()
  }

  public calculateAge(dateOfBirth: any) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.customerKycPersonal.controls.age.patchValue(age)
  }

  ageValidation() {
    if (this.customerKycPersonal.controls.gender.value) {
      if (this.customerKycPersonal.controls.gender.value == 'm') {
        this.customerKycPersonal.controls.age.setValidators(Validators.pattern('^0*(2[1-9]|[3-9][0-9]|100)$'))
      } else {
        this.customerKycPersonal.controls.age.setValidators(Validators.pattern('^0*(1[89]|[2-9][0-9]|100)$'))
      }
      this.customerKycPersonal.controls.age.markAsTouched()
      this.calculateAge(this.customerKycPersonal.controls.dateOfBirth.value)
    }
  }

  submit() {

    this.customerKycPersonal.patchValue({
      identityTypeId: this.reviewForm.get('identityTypeId').value,
      identityProofNumber: this.reviewForm.get('identityProofNumber').value,
    })

    let customerKycAddress = [];
    customerKycAddress.push(this.customerKycAddressOne.value, this.customerKycAddressTwo.value);

    // let customerKycBank = [];
    // customerKycBank.push(this.customerKycBank.value);

    const data = {
      customerId: this.data.customerId,
      customerKycId: this.data.customerKycId,
      customerKycPersonal: this.customerKycPersonal.value,
      customerKycAddress: customerKycAddress,
      // customerKycBank: customerKycBank
    }
    console.log(data)

    if (this.customerKycPersonal.invalid || this.customerKycAddressOne.invalid || this.customerKycAddressTwo.invalid) {
      this.customerKycPersonal.markAllAsTouched();
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
      // this.ref.detectChanges();
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
    let stateId = null;
    if (type == 'permanent') {
      stateId = this.customerKycAddressOne.controls.stateId.value;
    } else if (type == 'residential') {
      stateId = this.customerKycAddressTwo.controls.stateId.value;
    }
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
    if (this.userType == 5) {
      return;
    }
    if (type == 'identityProof') {
      this.data.customerKycReview.customerKycPersonal.identityProof.splice(index, 1)
      this.reviewForm.patchValue({ identityProofFileName: '' });
    } else if (type == 'residential') {
      this.data.customerKycReview.customerKycAddress[1].addressProof.splice(index, 1)
      this.customerKycAddressTwo.patchValue({ addressProofFileName: '' });
    } else if (type == 'permanent') {
      this.data.customerKycReview.customerKycAddress[0].addressProof.splice(index, 1)
      this.customerKycAddressOne.patchValue({ addressProofFileName: '' });
    } else if (type == 'passbook') {
      this.data.customerKycReview.customerKycBank[0].passbookProof.splice(index, 1)
      this.customerKycBank.patchValue({ passbookProofFileName: '' });
    }
  }

  getFileInfo(event, type: any) {
    if (this.userType == 5) {
      return;
    }
    this.file = event.target.files[0];
    // console.log(type);
    // console.log(this.addressControls)
    var name = event.target.files[0].name
    console.log(name)
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      this.sharedService.uploadFile(this.file).pipe(
        map(res => {

          if (type == "identityProof" && this.data.customerKycReview.customerKycPersonal.identityProof.length < 2) {
            this.data.customerKycReview.customerKycPersonal.identityProof.push(res.uploadFile.URL)
            this.customerKycPersonal.patchValue({ identityProof: this.data.customerKycReview.customerKycPersonal.identityProof })
            this.reviewForm.patchValue({ identityProofFileName: event.target.files[0].name });
          } else
            if (type == 'permanent' && this.data.customerKycReview.customerKycAddress[0].addressProof.length < 2) {
              this.data.customerKycReview.customerKycAddress[0].addressProof.push(res.uploadFile.URL)
              this.customerKycAddressOne.patchValue({ addressProof: this.data.customerKycReview.customerKycAddress[0].addressProof })
              this.customerKycAddressOne.patchValue({ addressProofFileName: event.target.files[0].name });
            } else
              if (type == 'residential' && this.data.customerKycReview.customerKycAddress[1].addressProof.length < 2) {
                this.data.customerKycReview.customerKycAddress[1].addressProof.push(res.uploadFile.URL)
                this.customerKycAddressTwo.patchValue({ addressProof: this.data.customerKycReview.customerKycAddress[1].addressProof })
                this.customerKycAddressTwo.patchValue({ addressProofFileName: event.target.files[0].name });
              } else
                if (type == "signature") {
                  this.data.customerKycReview.customerKycPersonal.signatureProof = res.uploadFile.URL;
                  this.customerKycPersonal.patchValue({ signatureProof: res.uploadFile.URL })
                  this.customerKycPersonal.patchValue({ signatureProofFileName: event.target.files[0].name });
                  this.ref.markForCheck();
                }
                else if (type == "profile") {
                  this.data.customerKycReview.customerKycPersonal.profileImage = res.uploadFile.URL;
                  this.customerKycPersonal.patchValue({ profileImage: res.uploadFile.URL })
                  this.ref.markForCheck();
                }
                else {
                  this.toastr.error("Cannot upload more than two images")
                }


          this.ref.detectChanges();
          // console.log(this.addressControls)
        }), catchError(err => {
          this.toastr.error(err.error.message);
          throw err
        }),
        finalize(() => {
          this.identity.nativeElement.value = '';
          this.permanent.nativeElement.value = '';
          this.residential.nativeElement.value = '';
          this.pass.nativeElement.value = '';
        })
      ).subscribe()
    } else {
      this.toastr.error('Upload Valid File Format');
    }

  }

  get controls() {
    return this.reviewForm.controls;
  }

  action() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.appliedKycService.userData.next(undefined)
  }

  webcam() {
    const dialogRef = this.dialog.open(WebcamDialogComponent,
      {
        data: {},
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.sharedService.uploadBase64File(res.imageAsDataUrl).subscribe(res => {
          console.log(res)
          this.data.customerKycReview.customerKycPersonal.profileImage = res.uploadFile.URL
          this.customerKycPersonal.get('profileImage').patchValue(this.data.customerKycReview.customerKycPersonal.profileImage);
          this.ref.detectChanges()
        })
      }
    });
  }

  previewImage(value) {
    // let concatArray = [];
    // concatArray
    // .push(this.data.customerKycReview.customerKycPersonal.profileImage, 
    //   this.data.customerKycReview.customerKycPersonal.signatureProof)
    // const temp = concatArray
    // .concat(this.data.customerKycReview.customerKycPersonal.identityProof,
    //   this.data.customerKycReview.customerKycAddress[0].addressProof,
    //   this.data.customerKycReview.customerKycAddress[1].addressProof)

    // let index = temp.indexOf(value)
    // this.dialog.open(ImagePreviewDialogComponent, {
    //   data: {
    //     images: temp,
    //     index: index
    //   },
    //   width: "auto"
    // })
  }
}
