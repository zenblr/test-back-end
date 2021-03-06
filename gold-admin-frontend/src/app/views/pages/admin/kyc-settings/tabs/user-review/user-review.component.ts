import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, Inject, ElementRef, OnDestroy } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'kt-user-review',
  templateUrl: './user-review.component.html',
  styleUrls: ['./user-review.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserReviewComponent implements OnInit, OnDestroy {

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
  @ViewChild("signature", { static: false }) signature;

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
  @Output() setModule: EventEmitter<any> = new EventEmitter<any>();
  isAddressSame: boolean = false;
  disabled: boolean;
  permission: any;
  resetOnPanChange = true;
  aadharCardUserDetails: any;
  customerData = { fatherName: '' };
  conf: { AadharDobScore: any; AadhaarNameScore: any; PanDOBScore: any; panNameScore: any; };
  reason: string;
  isAadharVerified: any = false;

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
    private ele: ElementRef,
    private route: ActivatedRoute,
    private ngxPermission: NgxPermissionsService,
    private datePipe: DatePipe
  ) {
    let res = this.sharedService.getDataFromStorage();
    this.userType = res.userDetails.userTypeId;

    if (this.modalData.action) {

      this.viewOnly = false;
    }

    this.ngxPermission.permissions$.subscribe(res => {
      this.permission = res
    })

  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.disabled = params.get("disabled") == 'true' ? true : false
    })

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

    this.setModule.next({ moduleId: this.data.moduleId, userType: this.data.userType })

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
      this.identityIdArray = identityArray.identityProof ? identityArray.identityProof : []
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

    // this.controls.panCardNumber.valueChanges.subscribe(res => {
    //   if (this.controls.panCardNumber.valid) {
    //     this.panButton = false;
    //   } else {
    //     this.panButton = true;
    //     this.isPanVerified = false;
    //   }
    // });

    if (!this.viewOnly || !this.permission.customerKycAdd) {
      this.reviewForm.disable();
      if (this.customerKycPersonal) this.customerKycPersonal.disable();
      this.customerKycAddressOne.disable();
      if (this.customerKycAddressTwo) this.customerKycAddressTwo.disable();
      if (this.customerOrganizationDetail) this.customerOrganizationDetail.disable();
    }

    console.log(this.data.customerKycReview.customerEKycDetails)
    let con = this.data.customerKycReview.customerEKycDetails
    this.conf = { AadharDobScore: con.aahaarDOBScore, AadhaarNameScore: con.aahaarNameScore, PanDOBScore: con.panDOBScore, panNameScore: con.panNameScore }
    
  }

  inputPAN() {
    if (this.controls.panCardNumber.valid) {
      this.panButton = false;
    } else {
      this.panButton = true;
      this.isPanVerified = false;
    }
  }
  
  initForm() {
    this.reviewForm = this.fb.group({
      id: [],
      profileImage: [, [Validators.required]],
      firstName: [, [Validators.required]],
      lastName: [, [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
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
      dateOfIncorporation: [],
      form60Image: [],
      form60Img: [],
      isCityEdit:[]
    })
    if(this.data.customerKycReview.panCardNumber){
      this.reviewForm.controls.panCardNumber.patchValue(this.data.customerKycReview.panCardNumber)
    }

    this.reviewForm.patchValue(this.data.customerKycReview)
    if (this.data.customerKycReview.customerKycPersonal) {
      this.reviewForm.patchValue(this.data.customerKycReview.customerKycPersonal)
      if (this.data.customerKycReview.panCardNumber) {
        this.reviewForm.patchValue({ panCardNumber: this.data.customerKycReview.panCardNumber })
        this.resetOnPanChange = false
      }

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
      landMark:[this.data.customerKycReview.customerKycAddress[0].landMark]
    })

    if (this.data.moduleId == 1 || (this.data.moduleId == 3 && this.data.userType == 'Corporate')) {
      this.customerKycAddressTwo = this.fb.group({
        id: [],
        customerKycId: [],
        customerId: [],
        addressType: [],
        address: [],
        stateId: [''],
        cityId: [''],
        pinCode: [, [Validators.pattern('[1-9][0-9]{5}')]],
        addressProof: [],
        addressProofFileName: [],
        addressProofTypeId: [''],
        addressProofNumber: [],
        landMark:[]
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
        alternateMobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
        gender: [, [Validators.required]],
        spouseName: [, [Validators.required]],
        martialStatus: ['', [Validators.required]],
        signatureProof: [],
        signatureProofFileName: [],
        occupationId: [],
        dateOfBirth: [, [Validators.required]],
        age: [, [Validators.required]],
        identityTypeId: [],
        identityProof: [],
        identityProofNumber: [],
        panCardNumber: [this.data.customerKycReview.panCardNumber]
      })

      this.customerKycPersonal.patchValue(this.data.customerKycReview.customerKycPersonal)
      this.customerKycPersonal.patchValue({
        martialStatus: this.data.customerKycReview.customerKycPersonal.martialStatus == null ? '' : this.data.customerKycReview.customerKycPersonal.martialStatus
      })
      if (this.data.customerKycReview.customerKycPersonal.martialStatus != 'married') {
        this.customerData['fatherName'] = this.data.customerKycReview.customerKycPersonal.spouseName
      }
    }
    const { customerKycAddress, customerKycPersonal, customerEKycDetails } = this.data.customerKycReview

    if (customerKycAddress[0].addressProofTypeId == 2) {
      this.aadharCardUserDetails = { ...customerKycAddress[0] }
    }

    else {
      this.aadharCardUserDetails = { ...customerKycAddress[1] }

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
      this.controls.panType.disable()
      this.ref.detectChanges()
    }

    if(this.data.customerKycReview.customerKyc.isCityEdit){
      this.reason = "City Details Fetch By karza was not matching the database"
    }else if(!(this.data.customerKycReview.customerEKycDetails && this.data.customerKycReview.customerEKycDetails.isPanVerified)){
      this.reason = "Pan was not verified By karza or confidence score must have not meet our standard's"
    }else if(!(this.data.customerKycReview.customerEKycDetails && this.data.customerKycReview.customerEKycDetails.isAahaarVerified)){
      this.reason = "Aadhar was not verified By karza or confidence score must have not meet our standard's"
    }
      if(this.data.customerKycReview.customerKycPersonal.identityProofNumber){
      this.isAadharVerified = true;
      this.ref.detectChanges()

    }

    this.setValidation()

    if (this.disabled) {
      this.disableControls()
    }

    this.ref.detectChanges()
  }

  panTypeValidation() {
    // this.controls.panType.valueChanges.subscribe(res => {
    const value = this.controls.panType.value
    if (value == 'form60') {
      if (this.resetOnPanChange) {
        this.controls.panCardNumber.patchValue('')
      }
      this.controls.panCardNumber.clearValidators()
      this.controls.panCardNumber.updateValueAndValidity()
      this.controls.panImage.setValidators([])
      this.controls.panImage.updateValueAndValidity()
      this.controls.form60Image.setValidators([Validators.required])
      this.controls.form60Image.updateValueAndValidity()
    }
    if (value == 'pan') {
      this.controls.form60.reset()
      this.controls.panCardNumber.setValidators([Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')])
      this.controls.panCardNumber.updateValueAndValidity()
      this.controls.form60Image.setValidators([])
      this.controls.form60Image.updateValueAndValidity()
      this.controls.panImage.setValidators([Validators.required])
      this.controls.panImage.updateValueAndValidity()
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
    this.customerKycPersonal.controls.dateOfBirth.patchValue(this.datePipe.transform(this.customerKycPersonal.controls.dateOfBirth.value, 'yyyy-MM-dd'))

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

    if (this.disabled) this.enableControls()

    if (this.isAddressSame) this.customerKycAddressTwo.enable()

    let customerKycAddress = [];
    let customerKycAddressTwo = this.customerKycAddressTwo ? this.customerKycAddressTwo.value : null
    customerKycAddress.push(this.customerKycAddressOne.value, customerKycAddressTwo);
    customerKycAddress = customerKycAddress.filter(e => e)

    if (this.reviewForm.invalid || this.customerKycPersonal && this.customerKycPersonal.invalid || this.customerKycAddressOne.invalid ||
      (this.customerKycAddressTwo && this.customerKycAddressTwo.invalid) || (this.customerOrganizationDetail && this.customerOrganizationDetail.invalid)) {
      if (this.customerKycPersonal && this.customerKycPersonal.invalid) this.customerKycPersonal.markAllAsTouched();
      if (this.customerKycAddressOne.controls.addressProof.invalid) {
        this.toastr.error('Upload address proof image')
      }
      this.customerKycAddressOne.markAllAsTouched();
      // this.customerKycAddressTwo.markAllAsTouched();
      this.reviewForm.markAllAsTouched()
      if (this.customerOrganizationDetail && this.customerOrganizationDetail.invalid) this.customerOrganizationDetail.markAllAsTouched()
      if (this.customerKycAddressTwo && this.customerKycAddressTwo.invalid) {
        this.customerKycAddressTwo.markAllAsTouched()
        if (this.customerKycAddressTwo.controls.addressProof.invalid) {
          this.toastr.error('Upload address proof image')
        }
      }
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
      this.patchNullToEmptyString()
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
      customerOrganizationDetail: this.customerOrganizationDetail ? this.customerOrganizationDetail.value : null,
      isCityEdit:this.controls.isCityEdit.value
    }
    this.userBankService.kycSubmit(data).pipe(
      map(res => {
        this.next.emit(true);
        this.userPersonalService.kycDetails = null
      }),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      }),
      finalize(() => {
        if (this.isAddressSame) this.customerKycAddressTwo.disable()
        if (this.disabled) this.disableControls()
      })
    ).subscribe()

  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      this.identityProofs = res.data.filter(filter => filter.name == 'Aadhaar Card');
      // if (this.reviewForm.controls.identityTypeId != this.identityProofs[0].id) {
      this.reviewForm.controls.identityTypeId.patchValue(this.identityProofs[0].id)
      if (this.customerKycPersonal) {
        this.customerKycPersonal.controls.identityTypeId.patchValue(this.identityProofs[0].id)
      }
      // }
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
      this.ref.detectChanges();
    });
    this.getCities('permanent');
    this.getCities('residential');
  }

  async getCities(type?) {
    let stateId = null;
    if (type == 'permanent') {
      stateId = this.customerKycAddressOne.controls.stateId.value;
    } else if (type == 'residential') {
      if ((this.data.moduleId == 3 && this.data.userType === 'Corporate') || this.data.moduleId == 1) {
        stateId = this.customerKycAddressTwo.controls.stateId.value;
      }
    }

    if (stateId) {
      let res = await this.sharedService.getCities(stateId)
      if (type == 'permanent') {
        this.cities0 = res['data'];
        const city0Exists = this.cities0.find(e => e.id === this.customerKycAddressOne.controls.cityId.value)
        if (!city0Exists) {
          this.customerKycAddressOne.controls.cityId.patchValue('');
        }
        this.ref.detectChanges();

      } else if (type == 'residential') {
        this.cities1 = res['data'];
        if ((this.data.moduleId == 3 && this.data.userType === 'Corporate') || this.data.moduleId == 1) {
          const city1Exists = this.cities1.find(e => e.id === this.customerKycAddressTwo.controls.cityId.value)
          if (!city1Exists) {
            this.customerKycAddressTwo.controls.cityId.patchValue('');
          }
        }
        this.ref.detectChanges();
      }

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

    if (type == 'identityProof') {
      this.identityImageArray.splice(index, 1)
      this.identityIdArray.splice(index, 1)
      this.identityFileNameArray.splice(index, 1)
      this.reviewForm.patchValue({ identityProof: this.identityIdArray });
      this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray });
      this.reviewForm.controls.identityProofNumber.reset()
      this.aadharCardUserDetails = null
      this.isAadharVerified = false
      this.removeImageFromAddress(index)           // remove from permanent address


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
      // this.data.customerKycReview.panImage = ''
      // this.reviewForm.controls.panCardNumber.patchValue(null)
      // this.customerKycPersonal.controls.panCardNumber.patchValue(null)
      // this.reviewForm.controls.form60.patchValue(null)
      // this.reviewForm.controls.panImage.patchValue(null)
      // this.reviewForm.controls.panImg.patchValue(null)

      // //changes
      // this.data.customerKycReview.panImage = ''
      // if (this.resetOnPanChange) {
      //   this.reviewForm.controls.panCardNumber.patchValue(null)
      //   this.customerKycPersonal.controls.panCardNumber.patchValue(null)
      // }
      // this.reviewForm.controls.form60.patchValue(null)
      // this.reviewForm.controls.panImage.patchValue(null)
      // this.reviewForm.controls.panImg.patchValue(null)
      // // changes

      let panType = this.controls.panType.value
      if (panType) {
        if (this.resetOnPanChange) {

          if (panType === 'pan') {
            this.reviewForm.controls.form60Image.patchValue(null)
            this.reviewForm.controls.form60Img.patchValue(null)
          }
          if (panType === 'form60') {
            this.reviewForm.controls.panImage.patchValue(null)
            this.reviewForm.controls.panImg.patchValue(null)
          }
          // this.reviewForm.controls.panCardNumber.patchValue(null)
          // this.customerKycPersonal.controls.panCardNumber.patchValue(null)
          this.reviewForm.controls.form60.patchValue(null)
        }
      }
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

  removeImageFromAddress(index) {
    const addressControlZero = this.customerKycAddressOne
    if (addressControlZero.get('addressProofTypeId').value == 2) {
      this.addressImageArray1.splice(index, 1)
      this.addressIdArray1.splice(index, 1)
      this.addressFileNameArray1.splice(index, 1)
      this.reviewForm.patchValue({ identityProof: this.identityIdArray });
      this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray });
      addressControlZero['controls'].stateId.reset()
      addressControlZero['controls'].cityId.reset()
      addressControlZero['controls'].address.reset()
      addressControlZero['controls'].pinCode.reset()
      addressControlZero['controls'].addressProofNumber.reset()
      if (this.isAddressSame) {
        this.addressImageArray2.splice(index, 1)
        this.addressIdArray2.splice(index, 1)
        this.addressFileNameArray2.splice(index, 1)
        this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
        this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2 });
        const addressControlOne = this.customerKycAddressTwo
        addressControlOne['controls'].stateId.reset()
        addressControlOne['controls'].cityId.reset()
        addressControlOne['controls'].address.reset()
        addressControlOne['controls'].pinCode.reset()
        addressControlOne['controls'].addressProofNumber.reset()
      }
    }
  }

  getFileInfo(event, type: any) {
    this.file = event.target.files[0];

    if (this.sharedService.fileValidator(event)) {
      this.getImageValidationForKarza(event, type)

    }
    // event.target.value = ''

    // else {
    //   this.toastr.error('Upload Valid File Format');
    // }

  }

  getImageValidationForKarza(event, type) {
    var details = event.target.files
    let ext = this.sharedService.getExtension(details[0].name)
    if (Math.round(details[0].size / 1024) > 4000 && ext != 'pdf') {
      this.toastr.error('Maximun size is 4MB')
      event.target.value = ''
      return
    }

    if (ext == 'pdf') {
      if (Math.round(details[0].size / 1024) > 2000) {
        this.toastr.error('Maximun size is 2MB')
      } else {
        this.uploadFile(type, event)
      }
      event.target.value = ''
      return
    }

    var reader = new FileReader()
    var reader = new FileReader();
    const img = new Image();

    img.src = window.URL.createObjectURL(details[0]);
    reader.readAsDataURL(details[0]);
    reader.onload = (_event) => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        window.URL.revokeObjectURL(img.src);
        if (width > 3000 || height > 3000) {
          this.toastr.error('Image of height and width should be less than 3000px')
          event.target.value = ''
        } else {
          this.uploadFile(type, details[0])
          event.target.value = ''

        }
      }, 1000);
    }
    // return data
    this.ref.detectChanges()
  }

  uploadFile(type, event) {
    const params = {
      reason: 'customer',
      customerId: this.customerKycAddressOne.controls.customerId.value
    }

    this.sharedService.uploadFile(this.file, params).pipe(
      map(res => {

        if (type == "identityProof" && this.identityImageArray.length < 2) {
          this.identityImageArray.push(res.uploadFile.URL)
          this.identityIdArray.push(res.uploadFile.path)
          this.identityFileNameArray.push(event.name)
          this.reviewForm.patchValue({ identityProof: this.identityIdArray })
          this.customerKycPersonal.patchValue({ identityProof: this.identityIdArray })
          this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray[this.identityFileNameArray.length - 1] });
          if (this.customerKycAddressOne.controls.addressProofTypeId.value == 2) {
            this.addressImageArray1.push(res.uploadFile.URL)
            this.addressIdArray1.push(res.uploadFile.path)
            this.addressFileNameArray1.push(event.name)
            this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 })
            this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
          }
          // if (this.identityImageArray.length == 2) {
          // this.getAaddharDetails()
          // }
        }
        else if (type == 'permanent' && this.addressImageArray1.length < 2) {
          this.addressImageArray1.push(res.uploadFile.URL)
          this.addressIdArray1.push(res.uploadFile.path)
          this.addressFileNameArray1.push(event.name)
          this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 })
          this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
        } else if (type == 'residential' && this.addressImageArray2.length < 2) {
          this.addressImageArray2.push(res.uploadFile.URL)
          this.addressIdArray2.push(res.uploadFile.path)
          this.addressFileNameArray2.push(event.name)
          this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 })
          this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2[this.addressFileNameArray2.length - 1] });
        } else if (type == "signature") {
          this.data.customerKycReview.customerKycPersonal.signatureProofImg = res.uploadFile.URL;
          this.customerKycPersonal.patchValue({ signatureProof: res.uploadFile.path })
          this.customerKycPersonal.patchValue({ signatureProofFileName: event.name });
          this.ref.markForCheck();
        } else if (type == "profile") {
          this.data.customerKycReview.customerKycPersonal.profileImg = res.uploadFile.URL;
          this.customerKycPersonal.patchValue({ profileImage: res.uploadFile.path })
          this.reviewForm.patchValue({ profileImage: res.uploadFile.path })
          this.ref.markForCheck();
        } else if (type == "panType") {
          this.reviewForm.controls.form60.patchValue(event.name)
          // this.reviewForm.controls.panImage.patchValue(res.uploadFile.path)
          // this.reviewForm.controls.panImg.patchValue(res.uploadFile.URL)

          let formControl = this.getFormControlPanForm60()
          this.controls[formControl.path].patchValue(res.uploadFile.path)
          this.controls[formControl.URL].patchValue(res.uploadFile.URL)

        } else if (type == "constitutionsDeed" && this.images.constitutionsDeed.length < 2) {
          this.images.constitutionsDeed.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
          this.customerOrganizationDetail.get('constitutionsDeedFileName').patchValue(res.uploadFile.originalname);
          this.customerOrganizationDetail.get('constitutionsDeed').patchValue(this.getPathArray('constitutionsDeed'));
        } else if (type == "gstCertificate" && this.images.gstCertificate.length < 2) {
          this.images.gstCertificate.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
          this.customerOrganizationDetail.get('gstCertificateFileName').patchValue(res.uploadFile.originalname);
          this.customerOrganizationDetail.get('gstCertificate').patchValue(this.getPathArray('gstCertificate'));
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
        if (this.signature && this.signature.nativeElement.value) this.signature.nativeElement.value = '';
      })
    ).subscribe()

  }

  getAaddharDetails() {
    if(this.identityImageArray.length == 0){
      this.toastr.error('Attach Aadhar card')
      return
    }
    this.userAddressService.getAaddharDetails(this.identityImageArray, this.data.customerId).subscribe(res => {
      this.aadharCardUserDetails = res.data
      this.controls.identityProofNumber.patchValue(res.data.idNumber)
      this.isAadharVerified =  res.data.isAahaarVerified
    })
  }
  // getFileInfo(event, type: any) {
  //   this.file = event;
  //   if (this.sharedService.fileValidator(event)) {
  //     const params = {
  //       reason: 'customer',
  //       customerId: this.customerKycAddressOne.controls.customerId.value
  //     }

  //     this.sharedService.uploadFile(this.file, params).pipe(
  //       map(res => {

  //         if (type == "identityProof" && this.identityImageArray.length < 2) {
  //           this.identityImageArray.push(res.uploadFile.URL)
  //           this.identityIdArray.push(res.uploadFile.path)
  //           this.identityFileNameArray.push(event.target.files[0].name)
  //           this.reviewForm.patchValue({ identityProof: this.identityIdArray })
  //           this.customerKycPersonal.patchValue({ identityProof: this.identityIdArray })
  //           this.reviewForm.patchValue({ identityProofFileName: this.identityFileNameArray[this.identityFileNameArray.length - 1] });
  //         }
  //         else if (type == 'permanent' && this.addressImageArray1.length < 2) {
  //           this.addressImageArray1.push(res.uploadFile.URL)
  //           this.addressIdArray1.push(res.uploadFile.path)
  //           this.addressFileNameArray1.push(event.target.files[0].name)
  //           this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 })
  //           this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
  //         } else if (type == 'residential' && this.addressImageArray2.length < 2) {
  //           this.addressImageArray2.push(res.uploadFile.URL)
  //           this.addressIdArray2.push(res.uploadFile.path)
  //           this.addressFileNameArray2.push(event.target.files[0].name)
  //           this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 })
  //           this.customerKycAddressTwo.patchValue({ addressProofFileName: this.addressFileNameArray2[this.addressFileNameArray2.length - 1] });
  //         } else if (type == "signature") {
  //           this.data.customerKycReview.customerKycPersonal.signatureProofImg = res.uploadFile.URL;
  //           this.customerKycPersonal.patchValue({ signatureProof: res.uploadFile.path })
  //           this.customerKycPersonal.patchValue({ signatureProofFileName: event.target.files[0].name });
  //           this.ref.markForCheck();
  //         } else if (type == "profile") {
  //           this.data.customerKycReview.customerKycPersonal.profileImg = res.uploadFile.URL;
  //           this.customerKycPersonal.patchValue({ profileImage: res.uploadFile.path })
  //           this.reviewForm.patchValue({ profileImage: res.uploadFile.path })
  //           this.ref.markForCheck();
  //         } else if (type == "panType") {
  //           this.reviewForm.controls.form60.patchValue(event.target.files[0].name)
  //           // this.reviewForm.controls.panImage.patchValue(res.uploadFile.path)
  //           // this.reviewForm.controls.panImg.patchValue(res.uploadFile.URL)

  //           let formControl = this.getFormControlPanForm60()
  //           this.controls[formControl.path].patchValue(res.uploadFile.path)
  //           this.controls[formControl.URL].patchValue(res.uploadFile.URL)

  //         } else if (type == "constitutionsDeed" && this.images.constitutionsDeed.length < 2) {
  //           this.images.constitutionsDeed.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
  //           this.customerOrganizationDetail.get('constitutionsDeedFileName').patchValue(res.uploadFile.originalname);
  //           this.customerOrganizationDetail.get('constitutionsDeed').patchValue(this.getPathArray('constitutionsDeed'));
  //         } else if (type == "gstCertificate" && this.images.gstCertificate.length < 2) {
  //           this.images.gstCertificate.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
  //           this.customerOrganizationDetail.get('gstCertificateFileName').patchValue(res.uploadFile.originalname);
  //           this.customerOrganizationDetail.get('gstCertificate').patchValue(this.getPathArray('gstCertificate'));
  //         }
  //         else {
  //           this.toastr.error("Cannot upload more than two images")
  //         }


  //         this.ref.detectChanges();
  //       }),
  //       catchError(err => {
  //         this.toastr.error(err.error.message);
  //         throw err
  //       }),
  //       finalize(() => {
  //         if (this.identity && this.identity.nativeElement.value) this.identity.nativeElement.value = '';
  //         if (this.permanent && this.permanent.nativeElement.value) this.permanent.nativeElement.value = '';
  //         if (this.residential && this.residential.nativeElement.value) this.residential.nativeElement.value = '';
  //         if (this.pass && this.pass.nativeElement.value) this.pass.nativeElement.value = '';
  //         if (this.constitutionsDeed && this.constitutionsDeed.nativeElement.value) this.constitutionsDeed.nativeElement.value = '';
  //         if (this.gstCertificate && this.gstCertificate.nativeElement.value) this.gstCertificate.nativeElement.value = '';
  //         if (this.signature && this.signature.nativeElement.value) this.signature.nativeElement.value = '';
  //         event.target.value = ''
  //       })
  //     ).subscribe()
  //   }
  //   else {
  //     event.target.value = ''
  //   }

  // }

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
    ...this.data.customerKycReview.panImg,...this.data.customerKycReview.form60Img,
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
          this.patchAaddarValue(0)
        } else {
          this.addressImageArray1 = [];
          this.addressIdArray1 = [];;
          this.customerKycAddressOne.patchValue({ addressProof: this.addressIdArray1 });
          this.customerKycAddressOne.patchValue({ addressProofNumber: '' });
          this.addressFileNameArray1 = []
          this.customerKycAddressOne.patchValue({ addressProofFileName: this.addressFileNameArray1 });
          // this.customerKycAddressOne.controls.addressProofFileName.enable()
          // this.customerKycAddressOne.controls.addressProofNumber.enable()
          this.resetAadharFields(0)
          // this.checkForVoter(0, 'permanent')
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
          this.patchAaddarValue(1)
        } else {
          this.addressImageArray2 = [];
          this.addressIdArray2 = [];;
          this.customerKycAddressTwo.patchValue({ addressProof: this.addressIdArray2 });
          this.customerKycAddressTwo.patchValue({ addressProofNumber: '' });
          this.addressFileNameArray2 = []
          this.customerKycAddressTwo.patchValue({ addressProofNumber: this.addressFileNameArray2 });
          // this.customerKycAddressTwo.controls.addressProofFileName.enable()
          // this.customerKycAddressTwo.controls.addressProofNumber.enable()
          this.resetAadharFields(1)
          // this.checkForVoter(1, 'permanent')
        }
        break;

      default:
        break;
    }

  }

  resetAadharFields(index) {

    let controls
    if (index == 0) {
      controls = this.customerKycAddressOne.controls
    } else {
      controls = this.customerKycAddressTwo.controls
    }
    controls.address.reset()
    controls.addressProofNumber.reset()
    controls.pinCode.reset()
    controls.stateId.reset()
    controls.cityId.reset()
    controls.pinCode.reset()
  }

  async patchAaddarValue(index) {
    this.controls.isCityEdit.patchValue(false)
    if (this.aadharCardUserDetails) {
      let controls
      let type
      if (index == 0) {
        controls = this.customerKycAddressOne.controls
        type = 'permanent'
      } else {
        controls = this.customerKycAddressTwo.controls
        type = 'residential'
      }
      controls.pinCode.patchValue(this.aadharCardUserDetails.pincode)
      controls.address.patchValue(this.aadharCardUserDetails.address)
      if (this.aadharCardUserDetails) {
        controls.pinCode.patchValue(this.aadharCardUserDetails.pincode ? this.aadharCardUserDetails.pincode : this.aadharCardUserDetails.pinCode)
        controls.address.patchValue(this.aadharCardUserDetails.address)
  
        if (this.aadharCardUserDetails.stateId) {
          controls.stateId.patchValue(this.aadharCardUserDetails.stateId)
          await this.getCities(index)
         
        } else {
          var stateId = this.states.filter(res => {
            if (res.name == this.aadharCardUserDetails.state)
              return res
          })
          if (stateId.length > 0) {
            controls.stateId.patchValue(stateId[0]['id'])
            await this.getCities(index)
          }
         
        }
  
        if (this.aadharCardUserDetails.cityId) {
          controls.cityId.patchValue(this.aadharCardUserDetails.cityId)
          this.controls.isCityEdit.patchValue(true)
         
        } else {
          if (index == 0) {
            var city = this.cities0.filter(res => {
              if (res.name == this.aadharCardUserDetails.city)
                return res
            })
          } else {
            city = this.cities1.filter(res => {
              if (res.name == this.aadharCardUserDetails.city)
                return res
            })
          }
  
          if (city.length > 0) {
            controls.cityId.patchValue(city[0]['id'])
            controls.cityId.disable()
            this.controls.isCityEdit.patchValue(false)
          } else {
            let data = {
              stateId: stateId[0]['id'],
              cityName: this.aadharCardUserDetails.city,
              cityUniqueId: null
            }
            this.sharedService.newCity(data).subscribe()
            this.controls.isCityEdit.patchValue(true)
  
          }
        }
  
  
  
        // controls.disable()
  
      }
      // controls.disable()

    }
  }


  checkForVoter(index: number, type: string) {
    let controls
    if (index == 0) {
      controls = this.customerKycAddressOne.controls
    } else {
      controls = this.customerKycAddressTwo.controls
    }
    if (this.images[type].length == 2 && controls.get('addressProofTypeId').value == 1) {
      this.getVoterIdDetails(index)

    }
  }

  getVoterIdDetails(index) {
    let images
    let controls
    if (index == 0) {
      images = this.addressImageArray1
      controls = this.customerKycAddressOne.controls
    } else {
      images = this.addressImageArray2
      controls = this.customerKycAddressTwo.controls
    }
    this.userAddressService.getVoterIdDetails(images, this.controls.customerId.value).subscribe(res => {
      controls.address.patchValue(res.data.address)
      controls.addressProofNumber.patchValue(res.data.idNumber)
      controls.pinCode.patchValue(res.data.pincode)
    })
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
    const controls = this.customerKycPersonal.controls
    if (this.customerKycPersonal.controls.martialStatus.value != 'married') {
      controls.spouseName.patchValue(this.customerData.fatherName)
    } else {
      controls.spouseName.reset()
    }
  }

  patchNullToEmptyString() {
    if (this.customerKycPersonal.controls.martialStatus.value == '') {
      this.customerKycPersonal.patchValue({ martialStatus: null })
    }
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
            this.customerKycPersonal.controls[key].setValidators([Validators.pattern('^[6-9][0-9]{9}$')]);
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

  sameAddressAsPermanent(event) {
    this.isAddressSame = event
    const addressOne = this.data.customerKycReview.customerKycAddress[0]
    const addressTwo = this.data.customerKycReview.customerKycAddress[1]

    if (event) {
      this.customerKycAddressTwo.patchValue(this.customerKycAddressOne.value)
      this.cities1 = this.cities0
      this.addressFileNameArray2 = this.addressFileNameArray1
      this.addressIdArray2 = this.addressIdArray1
      this.addressImageArray2 = this.addressImageArray1
      this.customerKycAddressTwo.disable()
    } else {
      this.customerKycAddressTwo.reset()
      this.cities1 = []
      this.addressFileNameArray2 = []
      this.addressIdArray2 = []
      this.addressImageArray2 = []
      this.customerKycAddressTwo.patchValue({
        stateId: '',
        cityId: '',
        addressProofTypeId: '',
        customerId: addressOne.customerId,
        customerKycId: addressOne.customerKycId
      })
      this.customerKycAddressTwo.enable()
    }

    this.customerKycAddressTwo.patchValue({ id: addressTwo ? addressTwo.id : null })

    if (this.data.moduleId == 1) {
      this.customerKycAddressTwo.controls.addressType.patchValue('residential')
    }
    if (this.data.moduleId == 3 && this.data.userType === 'Corporate') {
      this.customerKycAddressTwo.controls.addressType.patchValue('communication')
    }

  }

  isAddressSameCheck() {
    let addressOne: any = {}
    {
      addressOne.address = this.customerKycAddressOne.value.address,
        addressOne.stateId = this.customerKycAddressOne.value.stateId,
        addressOne.cityId = this.customerKycAddressOne.value.cityId,
        addressOne.pinCode = this.customerKycAddressOne.value.pinCode,
        addressOne.addressProof = this.customerKycAddressOne.value.addressProof,
        addressOne.addressProofTypeId = this.customerKycAddressOne.value.addressProofTypeId,
        addressOne.addressProofNumber = this.customerKycAddressOne.value.addressProofNumber
    }

    let addressTwo: any = {}
    {
      addressTwo.address = this.customerKycAddressTwo.value.address,
        addressTwo.stateId = this.customerKycAddressTwo.value.stateId,
        addressTwo.cityId = this.customerKycAddressTwo.value.cityId,
        addressTwo.pinCode = this.customerKycAddressTwo.value.pinCode,
        addressTwo.addressProof = this.customerKycAddressTwo.value.addressProof,
        addressTwo.addressProofTypeId = this.customerKycAddressTwo.value.addressProofTypeId,
        addressTwo.addressProofNumber = this.customerKycAddressTwo.value.addressProofNumber
    }
    this.isAddressSame = JSON.stringify(addressOne) === JSON.stringify(addressTwo)
    if (this.isAddressSame) {
      this.customerKycAddressTwo.disable()
    } else {
      this.customerKycAddressTwo.enable()
    }

    return this.isAddressSame
  }

  disableControls() {
    this.reviewForm.controls.firstName.disable()
    this.reviewForm.controls.lastName.disable()
    this.reviewForm.controls.mobileNumber.disable()
    this.reviewForm.controls.panType.disable()
    this.reviewForm.controls.panCardNumber.disable()
  }

  enableControls() {
    this.reviewForm.controls.firstName.enable()
    this.reviewForm.controls.lastName.enable()
    this.reviewForm.controls.mobileNumber.enable()
    this.reviewForm.controls.panType.enable()
    this.reviewForm.controls.panCardNumber.enable()
  }

  getFormControlPanForm60() {
    let panType = this.controls.panType.value
    if (panType) {
      if (panType === 'pan') {
        return { path: 'panImage', URL: 'panImg' }
      }
      if (panType === 'form60') {
        return { path: 'form60Image', URL: 'form60Img' }
      }
    }
  }
}
