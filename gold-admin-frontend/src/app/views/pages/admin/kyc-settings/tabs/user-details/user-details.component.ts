import { Component, OnInit, ViewChild, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrComponent } from '../../../../../partials/components';
import { UserDetailsService } from '../../../../../../core/kyc-settings';
import { map, finalize, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../../partials/components/pdf-viewer/pdf-viewer.component';
import { LeadService } from '../../../../../../core/lead-management/services/lead.service';

@Component({
  selector: 'kt-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  userBasicForm: FormGroup;
  refCode: number; //reference code
  otpButton = true;
  panButton = true;
  isPanVerified = false;
  isMobileVerified = false;
  otpSent = false;
  isOpverified = true;
  @ViewChild("pan", { static: false }) pan;
  @ViewChild('editPan', { static: false }) editPan;

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @Output() setModule: EventEmitter<any> = new EventEmitter<any>();

  showVerifyPAN = false;
  organizationTypes: any;
  maxDate = new Date()
  moduleId: any
  disabled: boolean;
  resetOnPanChange = true;

  constructor(
    public fb: FormBuilder,
    private userDetailsService: UserDetailsService,
    private toastr: ToastrService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private sharedServices: SharedService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private sharedService: SharedService,
    private router: Router,
    private leadService: LeadService
  ) { }

  ngOnInit() {
    this.initForm();
    this.route.queryParamMap.subscribe(params => {
      // if (params) {
      const MOB = params.get("mob");
      this.moduleId = params.get("moduleId");
      this.disabled = params.get("disabled") == 'true' ? true : false

      if (MOB) {
        this.controls.mobileNumber.patchValue(MOB);
        this.sendOTP();
      }

      if (this.moduleId) {
        this.controls.moduleId.patchValue(this.moduleId);
        // console.log(this.userBasicForm.value)
      }

      if (this.disabled) {
        this.disableControls()
      }

    })

    this.controls.mobileNumber.valueChanges.subscribe(res => {
      // if (this.controls.mobileNumber.valid) {
      //   this.sendOTP();
      //   this.otpButton = false;
      // } else {
      //   this.otpButton = true;
      //   this.isMobileVerified = false;
      //   this.otpSent = false;

      //   Object.keys(this.controls).forEach(key => {
      //     if (key != 'mobileNumber') {
      //       this.userBasicForm.get(key).reset();
      //     }
      //   })
      // }
    });

    this.controls.panCardNumber.valueChanges.subscribe(res => {
      if (this.controls.panCardNumber.valid || this.controls.panCardNumber.status == 'DISABLED') {
        this.panButton = false;
        // this.isPanVerified = true;

      } else {
        this.panButton = true;
        this.isPanVerified = false;
      }

      // this.verifyPAN()
    });

    this.controls.otp.valueChanges.subscribe(res => {
      if (this.controls.otp.valid) {
        this.isOpverified = false;
      } else {
        this.isOpverified = true;
      }
    });
  }

  inputNumber() {
    if (this.controls.mobileNumber.valid) {
      this.sendOTP();
      this.otpButton = false;
    } else {
      this.otpButton = true;
      this.isMobileVerified = false;
      this.otpSent = false;

      Object.keys(this.controls).forEach(key => {
        if (key != 'mobileNumber') {
          this.userBasicForm.get(key).reset();
        }
      })
    }
  }

  get controls() {
    if (this.userBasicForm) {
      return this.userBasicForm.controls
    }
  }

  initForm() {
    this.userBasicForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      otp: [, [, Validators.pattern('^[0-9]{4}$')]],
      referenceCode: [],
      panType: [, Validators.required],
      form60: [''],
      panImage: [],
      panImg: [],
      panCardNumber: [''],
      id: [],
      dateOfBirth: [],
      userType: [null],
      moduleId: [null],
      organizationTypeId: [null],
      dateOfIncorporation: [null],
      form60Image: [],
      form60Img: []
    })
  }

  sendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    this.userDetailsService.sendOtp({ mobileNumber, moduleId: this.moduleId }).subscribe(res => {
      if (res.message == 'Mobile number is already exist.') {
        this.toastr.error('Mobile Number already exists');
      } else {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        this.userBasicForm.patchValue(res.customerInfo);
        if ((res.customerInfo.panType && res.customerInfo.panType == 'pan' && res.customerInfo.panCardNumber) || (res.customerInfo.panType && res.customerInfo.panType == 'form60' && res.customerInfo.form60Image)) {
          this.resetOnPanChange = false
        }
        this.userBasicForm.patchValue({ moduleId: this.moduleId })
        if (this.controls.moduleId.value == 1) {
          this.userBasicForm.patchValue({ userType: null })
        }

        if (this.controls.moduleId.value == 3) {
          if (this.controls.userType.value == 'Corporate') {
            this.getOrganizationTypes()
          }
        }
        this.setModule.emit({ moduleId: this.moduleId, userType: this.controls.userType.value ? this.controls.userType.value : null })

        this.setValidation()

        if (res.customerInfo.panCardNumber !== null) {
          this.isPanVerified = true;
        } else {
          this.showVerifyPAN = true;
        }

        if (res.customerInfo.userType) {
          this.controls.userType.disable()
        }
      }
    }, (err) => {
      const message = err.error.message
      if (message === 'kindly complete scrap kyc' || message === 'kindly complete loan kyc') {
        this.router.navigate(['/admin/lead-management/new-requests'])
      }
    });
  }

  verifyOTP() {
    const params = {
      otp: this.controls.otp.value,
      referenceCode: this.controls.referenceCode.value,
    };
    this.userDetailsService.verifyOtp(params).subscribe(res => {
      if (res) {
        this.isMobileVerified = true;
      }
    });
  }

  resendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    // use send function OTP for resend OTP
    this.userDetailsService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res) {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.success(msg);
      }
    });
  }

  getFileInfo(event) {
    if (this.sharedService.fileValidator(event)) {
      let data = this.getImageValidationForKarza(event)
      console.log(data)
    } else {
      event.target.value = ''
    }
  }

  getImageValidationForKarza(event) {
    var details = event.target.files
    let ext = this.sharedService.getExtension(details[0].name)
    if (Math.round(details[0].size / 1024) > 4000 && ext != 'pdf') {
      this.toast.error('Maximun size is 4MB')
      event.target.value = ''
      return
    }

    if (ext == 'pdf') {
      if (Math.round(details[0].size / 1024) > 2000) {
        this.toast.error('Maximun size is 2MB')
      } else {
        this.uploadFile(event.target.files[0])
      }
      event.target.value = ''
      return
    }

    var reader = new FileReader()
    var reader = new FileReader();
    const img = new Image();

    img.src = window.URL.createObjectURL(details[0]);
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        window.URL.revokeObjectURL(img.src);
        if (width > 3000 || height > 3000) {
          this.toast.error('Image of height and width should be less than 3000px')
          event.target.value = ''
        } else {
          this.uploadFile(event.target.files[0])
        }
      }, 1000);
    }
    // return data
  }

  uploadFile(file) {
    const params = {
      reason: 'lead',
      customerId: this.controls.id.value
    }
    this.sharedServices.uploadFile(file, params).pipe(
      map(res => {
        if (res) {

          this.controls.form60.patchValue(file.name)
          // this.controls.panImage.patchValue(res.uploadFile.path)
          // this.controls.panImg.patchValue(res.uploadFile.URL)

          let formControl = this.getFormControlPanForm60()
          this.controls[formControl.path].patchValue(res.uploadFile.path)
          this.controls[formControl.URL].patchValue(res.uploadFile.URL)
          if (this.controls.panType.value == 'pan')
            this.getPanDetails()

        }
      }),
      catchError(err => {
        if (err.error.message) this.toast.error(err.error.message)
        throw err
      }),
      finalize(() => {
        if (this.editPan && this.editPan.nativeElement.value) this.editPan.nativeElement.value = ''
        if (this.pan && this.pan.nativeElement.value) this.pan.nativeElement.value = ''
        this.ref.detectChanges()

      })).subscribe()

  }
  preview(value) {
    const img = value
    const ext = this.sharedService.getExtension(img)
    if (ext == 'pdf') {
      this.dialog.open(PdfViewerComponent, {
        data: {
          pdfSrc: img,
          page: 1,
          showAll: true
        },
        width: "80%"
      })
    } else {
      this.dialog.open(ImagePreviewDialogComponent, {
        data: {
          images: [img],
          index: 0,
        },
        width: "auto"
      })
    }
  }

  getPanDetails() {
    this.controls.id.patchValue(656)
    this.leadService.getPanDetailsFromKarza(this.controls.panImg.value, this.controls.id.value).subscribe(res => {

      let name = res.data.name.split(" ")
      let lastName = name[name.length - 1]
      name.splice(name.length - 1, 1)
      this.controls.firstName.patchValue(name.join(" "))
      this.controls.lastName.patchValue(lastName)
      this.controls.panCardNumber.patchValue(res.data.idNumber)
      this.isPanVerified = res.data.isPanVerified
      this.controls.panCardNumber.disable()
      this.controls.firstName.disable()
      this.controls.lastName.disable()
    })
  }


  verifyPAN() {
    const panCardNumber = this.controls.panCardNumber.value;
    const dateOfBirth = this.controls.dateOfBirth.value
    this.leadService.panDetails({ panCardNumber }).subscribe(res => {
      if (res) {
        this.getVerified(panCardNumber, dateOfBirth, res.data.name)
        console.log(res)
        // this.isPanVerified = true;
      }
    });
  }

  getVerified(panCardNumber, dateOfBirth, fullName) {
    let data = { panCardNumber, dateOfBirth, fullName }
    this.leadService.verifyPAN(data).subscribe(res => {
      if (res.data.status == "Active") {
        this.isPanVerified = true;
      }
    });
  }

  public ageValidation() {
    const today = new Date();
    const birthDate = new Date(this.controls.dateOfBirth.value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      this.controls.dateOfBirth.setErrors({ invalid: true })
    }
    // this.controls.age.patchValue(age);
    // this.ageValidation()
  }

  submit() {
    if (this.userBasicForm.invalid) {
      this.userBasicForm.markAllAsTouched()
      return
    }
    if (!this.isPanVerified && this.userBasicForm.controls.panType.value == 'pan') {
      return this.toastr.error('PAN is not Verfied')

    }
    if (this.disabled) this.enableControls()
    this.userBasicForm.enable()
    if (this.controls.panCardNumber.value) {
      const PAN = this.controls.panCardNumber.value.toUpperCase();
      this.userBasicForm.get('panCardNumber').patchValue(PAN)
    }
    const basicForm = this.userBasicForm.getRawValue();
    this.userDetailsService.basicDetails(basicForm).pipe(
      map(res => {

        if (res) {
          // this.next.emit(true);
          this.next.emit(res.data.customerKycCurrentStage);
        }
      }),
      catchError(err => {

        if (err.error.message == 'This customer Kyc information is already created.' && err.status == 404) {
          //   const kycStage = 2;
          // this.next.emit(true);
        }
        throw (err);
      }),
      finalize(() => {
        this.userBasicForm.controls.id.disable();
        this.userBasicForm.controls.otp.disable();
        this.userBasicForm.controls.referenceCode.disable();
        this.userBasicForm.enable()
        if (this.disabled) this.disableControls()
      })
    ).subscribe();
  }

  remove() {
    // //changes
    // if (this.resetOnPanChange) {
    //   this.controls.panCardNumber.patchValue(null)
    // }
    // this.controls.form60.patchValue(null)
    // this.controls.panImage.patchValue(null)
    // this.controls.panImg.patchValue(null)
    // //changes

    // this.controls.panCardNumber.patchValue(null)
    // this.controls.form60.patchValue(null)
    // this.controls.panImage.patchValue(null)
    // this.controls.panImg.patchValue(null)

    let panType = this.controls.panType.value
    if (panType) {
      if (this.resetOnPanChange) {
        if (panType === 'pan') {
          this.controls.form60Image.patchValue(null)
          this.controls.form60Img.patchValue(null)
        }
        if (panType === 'form60') {
          this.controls.panImage.patchValue(null)
          this.controls.panImg.patchValue(null)
        }
        this.controls.panCardNumber.patchValue(null)
        this.controls.form60.patchValue(null)
      }
    }
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

  changeUserType(value) {
    if (value === 'Corporate') {
      this.getOrganizationTypes()
      this.setOrganizationValidation()
    }
    if (value === 'Individual') {
      this.unsetOrganizationValidation()
    }

  }

  getOrganizationTypes() {
    if (!this.organizationTypes) {
      this.userDetailsService.getOrganizationTypes().pipe(
        map(res => {
          // console.log(res)
          this.organizationTypes = res
        })).subscribe()
    }
  }

  setValidation() {
    if (this.controls.moduleId.value == 3) {
      this.controls.userType.setValidators([Validators.required])
      this.controls.userType.updateValueAndValidity()
    }
  }

  setOrganizationValidation() {
    this.controls.organizationTypeId.setValidators([Validators.required])
    this.controls.organizationTypeId.updateValueAndValidity()
    this.controls.dateOfIncorporation.setValidators([Validators.required])
    this.controls.dateOfIncorporation.updateValueAndValidity()
  }

  unsetOrganizationValidation() {
    this.controls.organizationTypeId.reset()
    this.controls.dateOfIncorporation.reset()
    this.controls.organizationTypeId.setValidators([])
    this.controls.organizationTypeId.updateValueAndValidity()
    this.controls.dateOfIncorporation.setValidators([])
    this.controls.dateOfIncorporation.updateValueAndValidity()
  }

  disableControls() {
    this.controls.firstName.disable()
    this.controls.lastName.disable()
    this.controls.mobileNumber.disable()
    this.controls.panType.disable()
    this.controls.panCardNumber.disable()
  }

  enableControls() {
    this.controls.firstName.enable()
    this.controls.lastName.enable()
    this.controls.mobileNumber.enable()
    this.controls.panType.enable()
    this.controls.panCardNumber.enable()
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

  setPanTypeValidation() {
    const panType = this.controls.panType.value
    if (panType == 'form60') {

      //current changes
      // this.controls.panCardNumber.patchValue('')
      this.controls.form60.reset()
      this.controls.panImage.setValidators([])
      this.controls.panImage.updateValueAndValidity()
      this.controls.panCardNumber.setValidators([])
      this.controls.panCardNumber.updateValueAndValidity()
      this.controls.form60Image.setValidators([Validators.required])
      this.controls.form60Image.updateValueAndValidity()
    }
    if (panType == 'pan') {

      this.controls.form60.reset()
      this.controls.panCardNumber.setValidators([Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')])
      this.controls.panCardNumber.updateValueAndValidity()
      this.controls.panImage.setValidators([Validators.required])
      this.controls.panImage.updateValueAndValidity()
      this.controls.form60Image.setValidators([])
      this.controls.form60Image.updateValueAndValidity()
    }
  }
}
