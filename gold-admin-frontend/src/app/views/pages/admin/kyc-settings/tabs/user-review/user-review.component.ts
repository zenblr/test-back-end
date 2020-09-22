import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, Inject, ElementRef } from '@angular/core';
import { UserAddressService, UserBankService, UserPersonalService, UserDetailsService } from '../../../../../../core/kyc-settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, filter, finalize, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AppliedKycService } from '../../../../../../core/applied-kyc/services/applied-kyc.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { WebcamDialogComponent } from '../../webcam-dialog/webcam-dialog.component';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../../partials/components/pdf-viewer/pdf-viewer.component';

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
  @ViewChild("constitutionsDeed", { static: false }) constitutionsDeed;
  @ViewChild("gstCertificate", { static: false }) gstCertificate;

  file: any;
  occupations = [];

  data: any = {};
  viewOnly = true;
  userType: any;
  identityImageArray = [];
  addressImageArray1 = [];
  addressImageArray2 = [];
  identityIdArray = [];
  addressIdArray1 = [];
  addressIdArray2 = [];
  identityFileNameArray = [];
  addressFileNameArray1 = [];
  addressFileNameArray2 = [];
  panButton = true;
  isPanVerified = false;
  customerOrganizationDetail: FormGroup;
  organizationTypes: any;
  images = { constitutionsDeed: [], gstCertificate: [] }

  //   data = {
  //     "customerId":206,
  //     "customerKycId":237,
  //     "customerKycCurrentStage":"4",
  //     "customerKycReview":{
  //        "id":206,
  //        "firstName":"bhupen",
  //        "lastName":"corporate",
  //        "panCardNumber":"ASDAS1234F",
  //        "mobileNumber":"9908324987",
  //        "userType":"Corporate",
  //        "organizationTypeId":3,
  //        "dateOfIncorporation":"2020-08-31T18:30:00.000Z",
  //        "moduleId":3,
  //        "customerKycPersonal":null,
  //        "organizationDetail":{
  //           "id":7,
  //           "customerId":206,
  //           "customerKycId":237,
  //           "email":"abc213@gmail.com",
  //           "alternateEmail":"bbb@gmail.com",
  //           "landLineNumber":null,
  //           "gstinNumber":"gstin667323",
  //           "cinNumber":null,
  //           "constitutionsDeed":[
  //              "uploads/customer/206/1600706045103.png",
  //              "uploads/customer/206/1600706082987.png"
  //           ],
  //           "gstCertificate":[
  //              "uploads/customer/206/1600705999142.pdf",
  //              "uploads/customer/206/1600706018546.pdf"
  //           ],
  //           "gstCertificateImages":[
  //              "https://8283d907b8a4.ngrok.io/uploads/customer/206/1600705999142.pdf",
  //              "https://8283d907b8a4.ngrok.io/uploads/customer/206/1600706018546.pdf"
  //           ],
  //           "constitutionsDeedImages":[
  //              "https://8283d907b8a4.ngrok.io/uploads/customer/206/1600706045103.png",
  //              "https://8283d907b8a4.ngrok.io/uploads/customer/206/1600706082987.png"
  //           ]
  //        },
  //        "customerKycAddress":[
  //           {
  //              "id":343,
  //              "customerKycId":237,
  //              "customerId":206,
  //              "addressType":"permanent",
  //              "address":"test per",
  //              "stateId":6,
  //              "cityId":594,
  //              "pinCode":400501,
  //              "addressProofTypeId":1,
  //              "addressProofNumber":"13242424",
  //              "addressProof":[
  //                 "uploads/customer/206/1600705796198.pdf"
  //              ],
  //              "state":{
  //                 "id":6,
  //                 "name":"Chandigarh",
  //                 "isActive":true
  //              },
  //              "city":{
  //                 "id":594,
  //                 "name":"Chandigarh",
  //                 "stateId":6,
  //                 "slug":null,
  //                 "isActive":true
  //              },
  //              "addressProofType":{
  //                 "id":1,
  //                 "name":"Voter ID",
  //                 "isActive":true,
  //                 "createdAt":"2020-05-04T13:48:00.807Z",
  //                 "updatedAt":"2020-05-04T13:48:00.807Z"
  //              },
  //              "addressProofImage":[
  //                 "https://8283d907b8a4.ngrok.io/uploads/customer/206/1600705796198.pdf"
  //              ]
  //           },
  //           {
  //              "id":344,
  //              "customerKycId":237,
  //              "customerId":206,
  //              "addressType":"communication",
  //              "address":"test comunicion",
  //              "stateId":19,
  //              "cityId":1844,
  //              "pinCode":800091,
  //              "addressProofTypeId":6,
  //              "addressProofNumber":"4000050001000",
  //              "addressProof":[
  //                 "uploads/customer/206/1600705834845.png",
  //                 "uploads/customer/206/1600705840844.png"
  //              ],
  //              "state":{
  //                 "id":19,
  //                 "name":"Kerala",
  //                 "isActive":true
  //              },
  //              "city":{
  //                 "id":1844,
  //                 "name":"Adoor",
  //                 "stateId":19,
  //                 "slug":null,
  //                 "isActive":true
  //              },
  //              "addressProofType":{
  //                 "id":6,
  //                 "name":"Utility bills",
  //                 "isActive":true,
  //                 "createdAt":"2020-05-18T11:41:50.724Z",
  //                 "updatedAt":"2020-05-18T11:41:50.724Z"
  //              },
  //              "addressProofImage":[
  //                 "https://8283d907b8a4.ngrok.io/uploads/customer/206/1600705834845.png",
  //                 "https://8283d907b8a4.ngrok.io/uploads/customer/206/1600705840844.png"
  //              ]
  //           }
  //        ],
  //        "organizationType":{
  //           "id":3,
  //           "organizationType":"Company"
  //        }
  //     }
  //  }

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

    this.getStates();
    if (this.data.moduleId == 1) {
      this.getIdentityType();
    }
    this.getAddressProofType();
    if (this.data.userType && this.data.userType === "Corporate") {
      this.getOrganizationTypes()
    } else {
      this.getOccupation();
    }

    if (this.data.moduleId == 1) {
      let identityArray = this.data.customerKycReview.customerKycPersonal
      this.identityImageArray = identityArray.identityProofImage
      this.identityIdArray = identityArray.identityProof
      this.reviewForm.controls.identityProof.patchValue(this.identityIdArray);
      this.customerKycPersonal.controls.identityProof.patchValue(this.identityIdArray);
    }

    let addressArray1 = this.data.customerKycReview.customerKycAddress[0]
    this.addressImageArray1 = addressArray1.addressProofImage
    this.addressIdArray1 = addressArray1.addressProof
    this.customerKycAddressOne.controls.addressProof.patchValue(this.addressIdArray1);

    if (this.data.moduleId == 1 || (this.data.moduleId == 3 && this.data.userType == 'Corporate')) {
      if (this.data.customerKycReview.customerKycAddress.length > 1) {
        let addressArray2 = this.data.customerKycReview.customerKycAddress[1]
        this.addressImageArray2 = addressArray2.addressProofImage
        this.addressIdArray2 = addressArray2.addressProof
        this.customerKycAddressTwo.controls.addressProof.patchValue(this.addressIdArray2);
      }
    }

    if (this.data.moduleId == 3 && this.data.userType == 'Corporate') {
      const { gstCertificate, gstCertificateImages } = this.data.customerKycReview.organizationDetail

      gstCertificate.forEach((key, i) => {
        const gstCertificateObject = { path: gstCertificate[i], URL: gstCertificateImages[i] }
        this.images.gstCertificate.push(gstCertificateObject)
      })

      if (this.data.customerKycReview.organizationDetail.constitutionsDeed.length) {
        const { constitutionsDeed, constitutionsDeedImages } = this.data.customerKycReview.organizationDetail

        constitutionsDeed.forEach((key, i) => {
          const constitutionsDeedObject = { path: constitutionsDeed[i], URL: constitutionsDeedImages[i] }
          this.images.constitutionsDeed.push(constitutionsDeedObject)
        })
      }
    }

    this.controls.panCardNumber.valueChanges.subscribe(res => {
      if (this.controls.panCardNumber.valid) {
        this.panButton = false;
      } else {
        this.panButton = true;
        this.isPanVerified = false;
      }
    });

    if (!this.viewOnly || this.userType == 5) {
      this.reviewForm.disable();
      if (this.customerKycPersonal) this.customerKycPersonal.disable();
      this.customerKycAddressOne.disable();
      if (this.customerKycAddressTwo) this.customerKycAddressTwo.disable();
      if (this.customerOrganizationDetail) this.customerOrganizationDetail.disable();
    }

  }

  initForm() {
    this.reviewForm = this.fb.group({
      id: [],
      profileImage: [, [Validators.required]],
      firstName: [, [Validators.required]],
      lastName: [, [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      panCardNumber: [, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      panType: [, Validators.required],
      form60: [],
      panImage: [],
      panImg: [],
      identityTypeId: [, [Validators.required]],
      identityProof: [, [Validators.required]],
      identityProofFileName: [],
      identityProofNumber: [, [Validators.required, Validators.pattern('[0-9]{12}')]],
      userType: [],
      organizationTypeId: [],
      dateOfIncorporation: []
    })

    this.reviewForm.patchValue(this.data.customerKycReview)
    if (this.data.customerKycReview.customerKycPersonal) {
      this.reviewForm.patchValue(this.data.customerKycReview.customerKycPersonal)
    }

    // User Corporate
    if (this.data.userType && (this.data.userType == 'Corporate' || this.data.userType == 'Individual')) {
      this.reviewForm.controls.identityTypeId.disable()
      this.reviewForm.controls.identityProof.disable()
      this.reviewForm.controls.identityProofFileName.disable()
      this.reviewForm.controls.identityProofNumber.disable()
    }

    this.customerKycAddressOne = this.fb.group({
      id: this.data.customerKycReview.customerKycAddress[0].id,
      customerKycId: this.data.customerKycReview.customerKycAddress[0].customerKycId,
      customerId: this.data.customerKycReview.customerKycAddress[0].customerId,
      addressType: [this.data.customerKycReview.customerKycAddress[0].addressType, [Validators.required]],
      address: [this.data.customerKycReview.customerKycAddress[0].address, [Validators.required]],
      stateId: [this.data.customerKycReview.customerKycAddress[0].state.id, [Validators.required]],
      cityId: [this.data.customerKycReview.customerKycAddress[0].city.id, [Validators.required]],
      pinCode: [this.data.customerKycReview.customerKycAddress[0].pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      addressProof: [, [Validators.required]],
      addressProofFileName: [],
      addressProofTypeId: [this.data.customerKycReview.customerKycAddress[0].addressProofType.id, [Validators.required]],
      addressProofNumber: [this.data.customerKycReview.customerKycAddress[0].addressProofNumber, [Validators.required]],
    })

    if (this.data.moduleId == 1 || (this.data.moduleId == 3 && this.data.userType == 'Corporate')) {
      this.customerKycAddressTwo = this.fb.group({
        id: [],
        customerKycId: [],
        customerId: [],
        addressType: [],
        address: [],
        stateId: [],
        cityId: [],
        pinCode: [, [Validators.pattern('[1-9][0-9]{5}')]],
        addressProof: [],
        addressProofFileName: [],
        addressProofTypeId: [],
        addressProofNumber: [],
      })

      if (this.data.customerKycReview.customerKycAddress.length > 1) {
        this.customerKycAddressTwo.patchValue(this.data.customerKycReview.customerKycAddress[1])
        this.customerKycAddressTwo.patchValue({
          stateId: this.data.customerKycReview.customerKycAddress[1].state.id,
          cityId: this.data.customerKycReview.customerKycAddress[1].city.id,
          addressProofTypeId: this.data.customerKycReview.customerKycAddress[1].addressProofType.id,
        })
      }
      if (this.data.moduleId == 1 && this.data.customerKycReview.customerKycAddress.length == 1) {
        this.customerKycAddressTwo.patchValue({
          addressType: 'residential',
          customerId: this.data.customerKycReview.customerKycAddress[0].customerId,
          customerKycId: this.data.customerKycReview.customerKycAddress[0].customerKycId
        })
      }
    }

    if (this.data.userType && this.data.userType == 'Corporate') {
      this.customerOrganizationDetail = this.fb.group({
        customerId: [],
        customerKycId: [],
        email: [, [Validators.required, Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')]],
        alternateEmail: [null, [Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')]],
        landLineNumber: [null],
        gstinNumber: [null, [Validators.required]],
        cinNumber: [null],
        constitutionsDeed: [[]],
        constitutionsDeedFileName: [],
        constitutionsDeedImages: [],
        gstCertificate: [[], [Validators.required]],
        gstCertificateFileName: [],
        gstCertificateImages: [],
      })

      this.customerOrganizationDetail.patchValue(this.data.customerKycReview.organizationDetail)

      this.reviewForm.patchValue({
        userType: this.data.userType,
        organizationTypeId: this.data.customerKycReview.organizationType.id,
        dateOfIncorporation: this.data.customerKycReview.dateOfIncorporation
      })
    } else {
      this.customerKycPersonal = this.fb.group({
        profileImage: [, [Validators.required]],
        alternateMobileNumber: [, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        gender: [, [Validators.required]],
        spouseName: [, [Validators.required]],
        martialStatus: [, [Validators.required]],
        signatureProof: [],
        signatureProofFileName: [],
        occupationId: [],
        dateOfBirth: [, [Validators.required]],
        age: [, [Validators.required]],
        identityTypeId: [, [Validators.required]],
        identityProof: [, [Validators.required]],
        identityProofNumber: [, [Validators.required]],
        panCardNumber: [this.data.customerKycReview.panCardNumber]
      })

      this.customerKycPersonal.patchValue(this.data.customerKycReview.customerKycPersonal)
    }

    if (this.data.moduleId == 3) {
      if (this.data.userType == 'Individual') {
        if (this.data.customerKycReview.customerKycPersonal.occupation !== null) {
          this.customerKycPersonal.get('occupationId').patchValue(this.data.customerKycReview.customerKycPersonal.occupation.id)
        }
        if (this.data.customerKycReview.customerKycPersonal.signatureProofData !== null) {
          this.customerKycPersonal.controls.signatureProof.patchValue(this.data.customerKycReview.customerKycPersonal.signatureProof)
        }
      }
    } else {
      if (this.data.customerKycReview.customerKycPersonal.occupation !== null) {
        this.customerKycPersonal.get('occupationId').patchValue(this.data.customerKycReview.customerKycPersonal.occupation.id)
      }
      if (this.data.customerKycReview.customerKycPersonal.signatureProofData !== null) {
        this.customerKycPersonal.controls.signatureProof.patchValue(this.data.customerKycReview.customerKycPersonal.signatureProof)
      }

    }


    this.panTypeValidation();

    if (this.data.customerKycReview.panCardNumber) {
      this.isPanVerified = true
      this.ref.detectChanges()
    }

    this.setValidation()

    this.bindScrapToLoan()

    this.ref.detectChanges()
  }

  panTypeValidation() {
    // this.controls.panType.valueChanges.subscribe(res => {
    const value = this.controls.panType.value
    if (value == 'form60') {
      this.controls.panCardNumber.reset()
      this.controls.panCardNumber.patchValue('')
      this.controls.panCardNumber.clearValidators()
      this.controls.panCardNumber.updateValueAndValidity()
    }
    if (value == 'pan') {
      this.controls.form60.reset()
      this.controls.panCardNumber.setValidators([Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')])
      this.controls.panCardNumber.updateValueAndValidity()
    }
    // });
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

    let customerKycAddress = [];
    let customerKycAddressTwo = this.customerKycAddressTwo ? this.customerKycAddressTwo.value : null
    customerKycAddress.push(this.customerKycAddressOne.value, customerKycAddressTwo);
    customerKycAddress = customerKycAddress.filter(e => e)

    if (this.reviewForm.invalid || this.customerKycPersonal && this.customerKycPersonal.invalid || this.customerKycAddressOne.invalid ||
      (this.customerKycAddressTwo && this.customerKycAddressTwo.invalid) || (this.customerOrganizationDetail && this.customerOrganizationDetail.invalid)) {
      if (this.customerKycPersonal && this.customerKycPersonal.invalid) this.customerKycPersonal.markAllAsTouched();
      this.customerKycAddressOne.markAllAsTouched();
      // this.customerKycAddressTwo.markAllAsTouched();
      this.reviewForm.markAllAsTouched()
      if (this.customerOrganizationDetail && this.customerOrganizationDetail.invalid) this.customerOrganizationDetail.markAllAsTouched()
      if (this.customerKycAddressTwo && this.customerKycAddressTwo.invalid) this.customerKycAddressTwo.markAllAsTouched()
      return;
    }

    if (!this.isPanVerified && this.reviewForm.controls.panType.value == 'pan') {
      return this.toastr.error('PAN is not Verfied')
    }

    if (this.customerKycPersonal) {
      this.customerKycPersonal.patchValue({
        identityTypeId: this.reviewForm.get('identityTypeId').value,
        identityProofNumber: this.reviewForm.get('identityProofNumber').value,
        panCardNumber: this.reviewForm.get('panCardNumber').value ? this.reviewForm.get('panCardNumber').value.toUpperCase() : null
      })
    }

    this.reviewForm.patchValue({
      panCardNumber: this.reviewForm.get('panCardNumber').value ? this.reviewForm.get('panCardNumber').value.toUpperCase() : null
    })

    const data = {
      customerId: this.data.customerId,
      customerKycId: this.data.customerKycId,
      customerKycPersonal: this.customerKycPersonal ? this.customerKycPersonal.value : null,
      customerKycAddress: customerKycAddress,
      customerKycBasicDetails: this.reviewForm.value,
      moduleId: this.data.moduleId,
      userType: this.data.userType,
      customerOrganizationDetail: this.customerOrganizationDetail ? this.customerOrganizationDetail.value : null
    }

    this.userBankService.kycSubmit(data).pipe(
      map(res => {
        this.next.emit(true);
      }), catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      })
    ).subscribe()

  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      this.identityProofs = res.data.filter(filter => filter.name == 'Aadhaar Card');
      this.ref.detectChanges()
    })
  }

  getAddressProofType() {
    this.userAddressService.getAddressProofType().subscribe(res => {
      this.addressProofs = res.data;
      this.ref.detectChanges()
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.data;
    });
    this.getCities('permanent');
    this.getCities('residential');
  }

  getCities(type?) {
    let stateId = null;
    if (type == 'permanent') {
      stateId = this.customerKycAddressOne.controls.stateId.value;
    } else if (type == 'residential') {
      if ((this.data.moduleId == 3 && this.data.userType === 'Corporate') || this.data.moduleId == 1) {
        stateId = this.customerKycAddressTwo.controls.stateId.value;
      }
    }

    if (stateId) {
      this.sharedService.getCities(stateId).subscribe(res => {
        if (type == 'permanent') {
          this.cities0 = res.data;
          const city0Exists = this.cities0.find(e => e.id === this.customerKycAddressOne.controls.cityId.value)
          if (!city0Exists) {
            this.customerKycAddressOne.controls.cityId.patchValue('');
          }
          this.ref.detectChanges();

        } else if (type == 'residential') {
          this.cities1 = res.data;
          if ((this.data.moduleId == 3 && this.data.userType === 'Corporate') || this.data.moduleId == 1) {
            const city1Exists = this.cities1.find(e => e.id === this.customerKycAddressTwo.controls.cityId.value)
            if (!city1Exists) {
              this.customerKycAddressTwo.controls.cityId.patchValue('');
            }
          }
          this.ref.detectChanges();
        }
      });
    }




  }

  getOccupation() {
    this.userPersonalService.getOccupation().subscribe(res => {
      this.occupations = res.data;
      this.ref.detectChanges();
    })
  }

  verifyPAN() {
    if (this.reviewForm.controls.panCardNumber.invalid)
      return this.reviewForm.controls.panCardNumber.markAsTouched()
    if (this.reviewForm.controls.panType.value == 'pan' && this.reviewForm.controls.panCardNumber.valid)
      this.isPanVerified = true;
  }


  removeImages(index, type) {

    // if (this.userType == 5) {
    //   return;
    // }

    if (type == 'identityProof') {
      this.identityImageArray.splice(index, 1)
      this.identityIdArray.splice(index, 1)
      this.identityFileNameArray.splice(index, 1)
      this.reviewForm.patchValue({ identityProof: this.identityIdArray });
      this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray });
    } else if (type == 'residential') {
      this.addressImageArray2.splice(index, 1)
      this.addressIdArray2.splice(index, 1)
      this.addressFileNameArray2.splice(index, 1)
      this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
      this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2 });

    } else if (type == 'permanent') {
      this.addressImageArray1.splice(index, 1)
      this.addressIdArray1.splice(index, 1)
      this.addressFileNameArray1.splice(index, 1)
      this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 });
      this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1 });
    }
    else if (type == 'signature') {
      this.data.customerKycReview.customerKycPersonal.signatureProofImg = ''
      this.data.customerKycReview.customerKycPersonal.signatureProof = null
      this.customerKycPersonal.patchValue({
        signatureProof: this.data.customerKycReview.customerKycPersonal.signatureProof,
        signatureProofFileName: ''
      });
    }
    // else if (type == 'passbook') {
    // this.data.customerKycReview.customerKycBank[0].passbookProof.splice(index, 1)
    // this.customerKycBank.patchValue({ passbookProofFileName: '' });
    // }
    else if (type == 'panType') {
      this.data.customerKycReview.panImage = ''
      this.reviewForm.controls.panCardNumber.patchValue(null)
      this.customerKycPersonal.controls.panCardNumber.patchValue(null)
      this.reviewForm.controls.form60.patchValue(null)
      this.reviewForm.controls.panImage.patchValue(null)
      this.reviewForm.controls.panImg.patchValue(null)
    }
    if (type == 'constitutionsDeed') {
      this.images.constitutionsDeed.splice(index, 1);
      this.customerOrganizationDetail.get('constitutionsDeed').patchValue(this.getPathArray('constitutionsDeed'));
    }
    if (type == 'gstCertificate') {
      this.images.gstCertificate.splice(index, 1);
      this.customerOrganizationDetail.get('gstCertificate').patchValue(this.getPathArray('gstCertificate'));
    }
  }

  getFileInfo(event, type: any) {
    // if (this.userType == 5) {
    //   return;
    // }
    this.file = event.target.files[0];
    // var name = event.target.files[0].name

    // var ext = name.split('.')
    if (this.sharedService.fileValidator(event)) {
      const params = {
        reason: 'customer',
        customerId: this.customerKycAddressOne.controls.customerId.value
      }

      // const params = {
      //   reason: 'lead',
      //   customerId:  this.reviewForm.controls.id.value
      // }


      this.sharedService.uploadFile(this.file, params).pipe(
        map(res => {

          if (type == "identityProof" && this.identityImageArray.length < 2) {
            this.identityImageArray.push(res.uploadFile.URL)
            this.identityIdArray.push(res.uploadFile.path)
            this.identityFileNameArray.push(event.target.files[0].name)

            this.customerKycPersonal.patchValue({ identityProof: this.identityIdArray })
            this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray[this.identityFileNameArray.length - 1] });
          }
          else if (type == 'permanent' && this.addressImageArray1.length < 2) {
            this.addressImageArray1.push(res.uploadFile.URL)
            this.addressIdArray1.push(res.uploadFile.path)
            this.addressFileNameArray1.push(event.target.files[0].name)
            this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 })
            this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
          } else if (type == 'residential' && this.addressImageArray2.length < 2) {
            this.addressImageArray2.push(res.uploadFile.URL)
            this.addressIdArray2.push(res.uploadFile.path)
            this.addressFileNameArray2.push(event.target.files[0].name)
            this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 })
            this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2[this.addressFileNameArray2.length - 1] });
          } else if (type == "signature") {
            this.data.customerKycReview.customerKycPersonal.signatureProofImg = res.uploadFile.URL;
            this.customerKycPersonal.patchValue({ signatureProof: res.uploadFile.path })
            this.customerKycPersonal.patchValue({ signatureProofFileName: event.target.files[0].name });
            this.ref.markForCheck();
          } else if (type == "profile") {
            this.data.customerKycReview.customerKycPersonal.profileImg = res.uploadFile.URL;
            this.customerKycPersonal.patchValue({ profileImage: res.uploadFile.path })
            this.reviewForm.patchValue({ profileImage: res.uploadFile.path })
            this.ref.markForCheck();
          } else if (type == "panType") {
            this.reviewForm.controls.form60.patchValue(event.target.files[0].name)
            this.reviewForm.controls.panImage.patchValue(res.uploadFile.path)
            this.reviewForm.controls.panImg.patchValue(res.uploadFile.URL)
          } else if (type == "constitutionsDeed" && this.images.constitutionsDeed.length < 2) {
            this.images.constitutionsDeed.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
            this.customerOrganizationDetail.get('constitutionsDeedFileName').patchValue(res.uploadFile.originalname);
            this.customerOrganizationDetail.get('constitutionsDeed').patchValue(this.getPathArray('constitutionsDeed'));
          } else if (type == "gstCertificate" && this.images.gstCertificate.length < 2) {
            this.images.gstCertificate.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
            this.customerOrganizationDetail.get('gstCertificateFileName').patchValue(res.uploadFile.originalname);
            this.customerOrganizationDetail.get('gstCertificate').patchValue(this.getPathArray('constitutionsDeed'));
          }
          else {
            this.toastr.error("Cannot upload more than two images")
          }


          this.ref.detectChanges();
        }),
        catchError(err => {
          this.toastr.error(err.error.message);
          throw err
        }),
        finalize(() => {
          if (this.identity && this.identity.nativeElement.value) this.identity.nativeElement.value = '';
          if (this.permanent && this.permanent.nativeElement.value) this.permanent.nativeElement.value = '';
          if (this.residential && this.residential.nativeElement.value) this.residential.nativeElement.value = '';
          if (this.pass && this.pass.nativeElement.value) this.pass.nativeElement.value = '';
          if (this.constitutionsDeed && this.constitutionsDeed.nativeElement.value) this.constitutionsDeed.nativeElement.value = '';
          if (this.gstCertificate && this.gstCertificate.nativeElement.value) this.gstCertificate.nativeElement.value = '';
        })
      ).subscribe()
    }
    // else {
    //   this.toastr.error('Upload Valid File Format');
    // }

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
        const params = {
          reason: 'customer',
          customerId: this.customerKycAddressOne.controls.customerId.value
        }
        this.sharedService.uploadBase64File(res.imageAsDataUrl, params).subscribe(res => {

          this.data.customerKycReview.customerKycPersonal.profileImg = res.uploadFile.URL
          this.customerKycPersonal.get('profileImage').patchValue(res.uploadFile.path);
          this.reviewForm.get('profileImage').patchValue(res.uploadFile.path);
          this.ref.detectChanges()
        })
      }
    });
  }

  previewImage(value) {

    let temp = [...this.identityImageArray, ...this.addressImageArray1, ...this.addressImageArray2,
    ...(this.data.customerKycReview.customerKycPersonal ? this.data.customerKycReview.customerKycPersonal.profileImg : []),
    ...this.data.customerKycReview.panImg,
    ...(this.data.customerKycReview.customerKycPersonal ? this.data.customerKycReview.customerKycPersonal.signatureProofImg : [])
    ]

    temp = temp.filter(e => e)

    temp = temp.filter(e => {
      let ext = this.sharedService.getExtension(e)
      return ext !== 'pdf'
    })

    let index = temp.indexOf(value)
    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: temp,
        index: index,
        modal: !this.viewOnly
      },
      width: "auto"
    })
  }

  preview(value) {
    let filterImage = []
    Object.keys(this.images).forEach(res => {
      Array.prototype.push.apply(filterImage, this.getURLArray(res));
    })
    var temp = []

    filterImage = filterImage.filter(e => e)

    temp = filterImage.filter(e => {
      let ext = this.sharedService.getExtension(e)
      return ext !== 'pdf'
    })
    let index = temp.indexOf(value)
    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: temp,
        index: index,
        modal: !this.viewOnly
      },
      width: "auto"
    })
  }

  previewPdf(img) {
    this.dialog.open(PdfViewerComponent, {
      data: {
        pdfSrc: img,
        page: 1,
        showAll: true
      },
      width: "80%"
    })
  }

  checkForAadhar(key) {
    switch (key) {
      case 'permanent':
        if (this.customerKycAddressOne.controls.addressProofTypeId.value == 2) {
          this.addressImageArray1 = [];
          this.addressIdArray1 = [];
          Array.prototype.push.apply(this.addressImageArray1, this.identityImageArray)
          Array.prototype.push.apply(this.addressIdArray1, this.identityIdArray)
          this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 });
          this.customerKycAddressOne.patchValue({ addressProofNumber: this.reviewForm.controls.identityProofNumber.value });
          this.addressFileNameArray1 = this.identityFileNameArray
          this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
          // this.customerKycAddressOne.controls.addressProofFileName.disable()
          // this.customerKycAddressOne.controls.addressProofNumber.disable()
        } else {
          this.addressImageArray1 = [];
          this.addressIdArray1 = [];;
          this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 });
          this.customerKycAddressOne.patchValue({ addressProofNumber: '' });
          this.addressFileNameArray1 = []
          this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1 });
          // this.customerKycAddressOne.controls.addressProofFileName.enable()
          // this.customerKycAddressOne.controls.addressProofNumber.enable()
        }
        break;

      case 'residential':
        if (this.customerKycAddressTwo.controls.addressProofTypeId.value == 2) {
          this.addressImageArray2 = [];
          this.addressIdArray2 = [];
          Array.prototype.push.apply(this.addressImageArray2, this.identityImageArray)
          Array.prototype.push.apply(this.addressIdArray2, this.identityIdArray)
          this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
          this.customerKycAddressTwo.patchValue({ addressProofNumber: this.reviewForm.controls.identityProofNumber.value });
          this.addressFileNameArray2 = this.identityFileNameArray
          this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2[this.addressFileNameArray2.length - 1] });
          // this.customerKycAddressTwo.controls.addressProofFileName.disable()
          // this.customerKycAddressTwo.controls.addressProofNumber.disable()
        } else {
          this.addressImageArray2 = [];
          this.addressIdArray2 = [];;
          this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
          this.customerKycAddressTwo.patchValue({ addressProofNumber: '' });
          this.addressFileNameArray2 = []
          this.customerKycAddressTwo.patchValue({ addressProofNumber: this.addressFileNameArray2 });
          // this.customerKycAddressTwo.controls.addressProofFileName.enable()
          // this.customerKycAddressTwo.controls.addressProofNumber.enable()
        }
        break;

      default:
        break;
    }

  }


  checkOccupation(event) {
    if (event.target.value == 'null') {
      this.customerKycPersonal.controls.occupationId.patchValue(null)
    }
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

  changeMaritalStatus() {
    this.customerKycPersonal.controls.spouseName.reset()
  }

  getOrganizationTypes() {
    if (!this.organizationTypes) {
      this.userDetailsService.getOrganizationTypes().pipe(
        map(res => {
          // console.log(res)
          this.organizationTypes = res
          this.ref.detectChanges()
        })).subscribe()
    }
  }

  getPathArray(type: string) {
    const pathArray = this.images[type].map(e => e.path)
    return pathArray
  }

  getURLArray(type: string) {
    const URLArray = this.images[type].map(e => e.URL)
    return URLArray
  }

  bindScrapToLoan() {

  }

  setValidation() {
    if (this.data.moduleId == 3) {
      if (this.data.userType === 'Corporate') {
        // review form
        this.reviewForm.controls.organizationTypeId.setValidators([Validators.required])
        this.reviewForm.controls.organizationTypeId.updateValueAndValidity()
        this.reviewForm.controls.dateOfIncorporation.setValidators([Validators.required])
        this.reviewForm.controls.dateOfIncorporation.updateValueAndValidity()
        this.reviewForm.controls.profileImage.disable()
      } else if (this.data.userType === 'Individual') {
        // review form
        this.reviewForm.controls.profileImage.setValidators([])
        this.reviewForm.controls.profileImage.updateValueAndValidity()
        // personal form
        for (const key in this.customerKycPersonal.controls) {
          if (key == 'dateOfBirth' || key == 'gender') {
            this.customerKycPersonal.controls[key].setValidators([Validators.required]);
            this.customerKycPersonal.controls[key].updateValueAndValidity();
          }
          else if (key == 'alternateMobileNumber') {
            this.customerKycPersonal.controls[key].setValidators([Validators.pattern('^[0-9]{10}$')]);
            this.customerKycPersonal.controls[key].updateValueAndValidity();
          }
          else {
            this.customerKycPersonal.controls[key].setValidators([]);
            this.customerKycPersonal.controls[key].updateValueAndValidity();
          }
        }
      }
    }

    if (this.data.moduleId == 1) {
      this.reviewForm.controls.profileImage.setValidators([Validators.required])
      this.reviewForm.controls.profileImage.updateValueAndValidity()
      // address form
      let requiredControls = ['addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProof', 'addressProofTypeId', 'addressProofNumber']
      for (const key in this.customerKycAddressTwo.controls) {
        if (requiredControls.includes(key)) {
          this.customerKycAddressTwo.controls[key].setValidators([Validators.required]);
          this.customerKycAddressTwo.controls[key].updateValueAndValidity();
        }
      }
    }
  }

}
