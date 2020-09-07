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

  // @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  showVerifyPAN = false;
  pdf = {
    panImg: false
  }


  constructor(
    public fb: FormBuilder,
    private userDetailsService: UserDetailsService,
    private toastr: ToastrService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private sharedServices: SharedService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.initForm();
    this.route.queryParamMap.subscribe(params => {
      // if (params) {
      const MOB = params.get("mob");
      if (MOB) {
        this.controls.mobileNumber.patchValue(MOB);
        this.sendOTP();
      }

      // this.ref.detectChanges();
      // }
    })
    this.controls.mobileNumber.valueChanges.subscribe(res => {
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
      panType: ['', Validators.required],
      form60: [''],
      panImage: [, Validators.required],
      panImg: [],
      panCardNumber: [''],
      id: []
    })
  }

  sendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    this.userDetailsService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res.message == 'Mobile number is already exist.') {
        this.toastr.error('Mobile Number already exists');
      } else {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        this.userBasicForm.patchValue(res.customerInfo);
        
        if (res.customerInfo.panCardNumber !== null) {
          //this.controls.panCardNumber.disable();
          //this.controls.panType.disable();
          this.isPanVerified = true;
        } else {
          this.showVerifyPAN = true;
        }
        // const msg = 'Otp has been sent to the registered mobile number';
        // this.toastr.success(msg);
      }
    }, err => {
      // console.log(err.message);
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
    // var name = event.target.files[0].name
    // var ext = name.split('.')
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
            const ext = this.sharedService.getExtension(event.target.files[0].name)

            this.pdf.panImg = (ext === 'pdf') ? true : false
          }
        }), catchError(err => {
          throw err
        })).subscribe()
    }
    // else {
    //   this.toast.error('Upload Valid File Format')
    // }
  }

  preview(value) {
    // let img = [this.controls.panImage.value]
    // this.dialog.open(ImagePreviewDialogComponent, {
    //   data: {
    //     images: img,
    //     index: 0
    //   },
    //   width: "auto"
    // })

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
    if (this.userBasicForm.invalid) {
      this.userBasicForm.markAllAsTouched()
      return
    }
    if(!this.isPanVerified && this.userBasicForm.controls.panType.value == 'pan'){
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
      })
    ).subscribe();
  }

  remove() {
    this.controls.panCardNumber.patchValue(null)
    this.controls.form60.patchValue(null)
    this.controls.panImage.patchValue(null)
    this.controls.panImg.patchValue(null)
  }

}
