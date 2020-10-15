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
    private router: Router
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
      if (this.controls.panCardNumber.valid) {
        this.panButton = false;
        // this.isPanVerified = true;

      } else {
        this.panButton = true;
        this.isPanVerified = false;
      }

      // this.verifyPAN()
    });

    this.controls.panType.valueChanges.subscribe(res => {
      if (res == 'form60') {
        this.controls.panCardNumber.reset()
        this.controls.panCardNumber.patchValue('')
        this.controls.panCardNumber.clearValidators()
        this.controls.panCardNumber.updateValueAndValidity()
      }
      if (res == 'pan') {
        this.controls.form60.reset()
        this.controls.panCardNumber.setValidators([Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')])
        this.controls.panCardNumber.updateValueAndValidity()
      }
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
      mobileNumber: [, [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
      otp: [, [, Validators.pattern('^[0-9]{4}$')]],
      referenceCode: [],
      panType: [, Validators.required],
      form60: [''],
      panImage: [, Validators.required],
      panImg: [],
      panCardNumber: [''],
      id: [],
      userType: [null],
      moduleId: [null],
      organizationTypeId: [null],
      dateOfIncorporation: [null],
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
      const params = {
        reason: 'lead',
        customerId: this.controls.id.value
      }
      this.sharedServices.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (res) {
            this.controls.form60.patchValue(event.target.files[0].name)
            this.controls.panImage.patchValue(res.uploadFile.path)
            this.controls.panImg.patchValue(res.uploadFile.URL)
          }
        }),
        catchError(err => {
          if (err.error.message) this.toast.error(err.error.message)
          throw err
        }),
        finalize(() => {
          if (this.editPan && this.editPan.nativeElement.value) this.editPan.nativeElement.value = ''
          if (this.pan && this.pan.nativeElement.value) this.pan.nativeElement.value = ''
        })).subscribe()
    }
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


  verifyPAN() {
    // const panCardNumber = this.controls.panCardNumber.value;
    // this.userDetailsService.verifyPAN({ panCardNumber }).subscribe(res => {
    //   if (res) {
    //     this.isPanVerified = true;
    //   }
    // });

    // if (this.controls.panCardNumber.status == 'DISABLED' || this.controls.panCardNumber.valid) {
    //   this.panButton = false;
    //   this.isPanVerified = true;

    // } else {
    //   this.panButton = true;
    //   this.isPanVerified = false;
    // }

    this.isPanVerified = true;
  }

  submit() {
    this.enableControls()
    if (this.userBasicForm.invalid) {
      this.userBasicForm.markAllAsTouched()
      return
    }
    if (!this.isPanVerified && this.userBasicForm.controls.panType.value == 'pan') {
      return this.toastr.error('PAN is not Verfied')

    }
    this.userBasicForm.enable()
    if (this.controls.panCardNumber.value) {
      const PAN = this.controls.panCardNumber.value.toUpperCase();
      this.userBasicForm.get('panCardNumber').patchValue(PAN)
    }
    const basicForm = this.userBasicForm.value;
    this.userDetailsService.basicDetails(basicForm).pipe(
      map(res => {

        if (res) {
          // this.next.emit(true);
          this.next.emit(res.customerKycCurrentStage);
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
    this.controls.panCardNumber.patchValue(null)
    this.controls.form60.patchValue(null)
    this.controls.panImage.patchValue(null)
    this.controls.panImg.patchValue(null)
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
  }

  enableControls() {
    this.controls.firstName.enable()
    this.controls.lastName.enable()
    this.controls.mobileNumber.enable()
    this.controls.panType.enable()
  }
}
