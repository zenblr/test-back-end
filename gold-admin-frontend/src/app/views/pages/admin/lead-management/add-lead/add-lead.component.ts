import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// material
import { DialogData } from '../../../material/popups-and-modals/dialog/dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
// services
import { SharedService } from '../../../../../core/shared/services/shared.service';
// components
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
import { map, catchError } from 'rxjs/operators';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { LeadSourceService } from '../../../../../core/masters/lead-source/services/lead-source.service';

@Component({
  selector: 'kt-add-lead',
  templateUrl: './add-lead.component.html',
  styleUrls: ['./add-lead.component.scss']
})
export class AddLeadComponent implements OnInit {

  modalTitle = 'Add New Lead';
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  leadForm: FormGroup;
  states: any;
  cities: any;
  status = [];
  otpButton = true;
  panButton = true;
  isPanVerified = false;
  isMobileVerified = false;
  otpSent = false;
  isOpverified = true;
  currentDate = new Date();

  viewOnly = false;

  refCode: number; //reference code
  mobileAlreadyExists = false;
  title: string;
  branches = []
  details: any;
  showCommentBox = false;
  leadSources = [];

  constructor(
    public dialogRef: MatDialogRef<AddLeadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private leadService: LeadService,
    private dialog: MatDialog,
    private leadSourceService: LeadSourceService
  ) {
    this.details = this.sharedService.getDataFromStorage()
    console.log(this.details)
  }

  ngOnInit() {
    this.formInitialize();
    this.setForm();
    this.getLeadSourceWithoutPagination();
    this.getInternalBranhces();
    this.getStates();
    this.getStatus();

    this.controls.mobileNumber.valueChanges.subscribe(res => {
      if (this.controls.mobileNumber.valid) {
        this.otpButton = false;
      } else {
        this.otpButton = true;
        this.isMobileVerified = false;
        this.otpSent = false;
      }
      this.mobileAlreadyExists = false;
    });

    this.controls.panType.valueChanges.subscribe(res => {
      if (this.controls.panType.value) {
        if (this.controls.panType.value == "pan") {
          this.controls.panCardNumber.setValidators(
            [
              Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$'),
              Validators.required
            ])
          this.controls.panCardNumber.updateValueAndValidity()
        } else {
          this.controls.panCardNumber.reset()
          this.controls.panCardNumber.clearValidators()
          this.controls.panCardNumber.updateValueAndValidity()
        }
        this.controls.panImage.reset()
        this.controls.panImage.setValidators(Validators.required)
        this.controls.panImage.updateValueAndValidity()
      } else {
        this.controls.panImage.reset()
        this.controls.panImage.clearValidators()
        this.controls.panImage.updateValueAndValidity()
        this.controls.panCardNumber.reset()
        this.controls.panCardNumber.clearValidators()
        this.controls.panCardNumber.updateValueAndValidity()
      }
    });

    this.controls.panCardNumber.valueChanges.subscribe(res => {
      if (this.controls.panCardNumber.valid && this.controls.panCardNumber.value !== '') {
        this.panButton = false;
      } else {
        this.panButton = true;
        this.isPanVerified = false;
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

  formInitialize() {
    this.leadForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      internalBranchId: [this.details.userDetails.internalBranchId, Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      otp: [, [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      referenceCode: [this.refCode],
      panCardNumber: [''],
      stateId: [this.details.userDetails.stateId, [Validators.required]],
      cityId: [this.details.userDetails.cityId, [Validators.required]],
      pinCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
      dateTime: [this.currentDate, [Validators.required]],
      statusId: [, [Validators.required]],
      panType: [''],
      form60: [''],
      panImage: [],
      panImg: [],
      comment: [''],
      leadSourceId: [''],
      source: [''],
    });
    this.getCities()
  }

  setForm() {
    if (this.data.action == 'edit') {
      this.getLeadById(this.data['id']);
      this.modalTitle = 'Edit Lead'
      this.viewOnly = true;
    } else if (this.data.action == 'view') {
      this.getLeadById(this.data['id']);
      this.modalTitle = 'View Lead'
      this.leadForm.disable()
    } else {
      this.modalTitle = 'Add New Lead'
    }
  }

  getInternalBranhces() {
    this.leadService.getInternalBranhces().subscribe(res => {
      this.branches = res.data;
    });
  }

  getLeadSourceWithoutPagination() {
    this.leadSourceService.getLeadSourceWithoutPagination().subscribe(res => {
      this.leadSources = res.data
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    });
  }

  getCities() {
    const stateId = this.controls.stateId.value;
    this.sharedService.getCities(stateId).subscribe(res => {
      this.cities = res.message;
    });
  }

  getStatus() {
    this.leadService.getStatus().pipe(
      map(res => {
        this.status = res;
      })
    ).subscribe();
  }

  getLeadById(id) {
    this.leadService.getLeadById(id).subscribe(res => {
      // console.log(res);
      this.leadForm.patchValue(res.singleCustomer);
      this.leadForm.patchValue({ panImage: res.singleCustomer.panImage.id })
      this.leadForm.patchValue({ panImg: res.singleCustomer.panImage.URL })
      this.getCities();
      this.commentBox()
    },
      error => {
        this.toastr.errorToastr(error.error.message);
      });
  }

  sendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    this.leadService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res.message == 'Mobile number is already exist.') {
        this.toastr.errorToastr('Mobile Number already exists');
        this.mobileAlreadyExists = true;
      } else {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.successToastr(msg);
      }
    }, error => {
      this.toastr.errorToastr(error.error.message);
    });
  }



  verifyOTP() {
    const params = {
      otp: this.controls.otp.value,
      referenceCode: this.controls.referenceCode.value,
    };
    this.leadService.verifyOtp(params).subscribe(res => {
      if (res) {
        this.isMobileVerified = true;
        this.checkforVerfication()

      }
    });
  }

  checkforVerfication() {
    if (this.isMobileVerified) {
      this.controls.otp.setErrors(null)
    } else if (!this.isMobileVerified) {
      this.controls.otp.setErrors({ verifyOTP: true })
    }
  }

  verifyPAN() {
    const panCardNumber = this.controls.panCardNumber.value;
    // this.leadService.verifyPAN({ panCardNumber }).subscribe(res => {
    //   if (res) {
    //     this.isPanVerified = true;
    //   }
    // });
    // setTimeout(() => {
    this.isPanVerified = true;
    // }, 1000);
  }

  resendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    // use send function OTP for resend OTP
    this.leadService.sendOtp({ mobileNumber }).subscribe(res => {
      if (res) {
        this.otpSent = true;
        this.refCode = res.referenceCode;
        this.controls.referenceCode.patchValue(this.refCode);
        const msg = 'Otp has been sent to the registered mobile number';
        this.toastr.successToastr(msg);
      }
    }, error => {
      this.toastr.errorToastr(error.error.message);
    });
  }

  get controls() {
    return this.leadForm.controls;
  }


  getFileInfo(event) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      const params = {
        reason: 'lead'
      }
      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (res) {
            // this.controls.form60.patchValue(event.target.files[0].name)
            this.controls.panImg.patchValue(res.uploadFile.URL)
            this.controls.panImage.patchValue(res.uploadFile.id)
          }
        }), catchError(err => {
          throw err
        })).subscribe()
    } else {
      this.toastr.errorToastr('Upload Valid File Format')
    }
  }

  preview() {
    console.log(this.controls.panImg.value)
    let img = [this.controls.panImg.value]
    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: img,
        index: 0,
        modal: true
      },
      width: "auto"
    })
  }

  remove() {
    this.controls.panImage.patchValue('')
    this.controls.panImg.patchValue('')
  }

  onSubmit() {

    if (this.data.action == 'add') {
      if (this.leadForm.invalid || !this.isMobileVerified || this.mobileAlreadyExists) {
        this.checkforVerfication()
        this.leadForm.markAllAsTouched();
        if (this.controls.panImage.invalid) {
          this.toastr.errorToastr('Image not Uploaded')
        }
        console.log(this.leadForm.value)
        return
      }

      if (this.controls.leadSourceId.value == "") {
        this.leadForm.get('leadSourceId').patchValue(null);
      } else {
        this.leadForm.get('leadSourceId').patchValue(Number(this.controls.leadSourceId.value));
      }
      if (this.controls.statusId.valid) {
        this.leadForm.get('statusId').patchValue(Number(this.controls.statusId.value));
      }
      if (this.controls.pinCode.valid) {
        this.leadForm.get('pinCode').patchValue(Number(this.controls.pinCode.value));
      }
      if (!this.controls.panCardNumber.value) {
        this.leadForm.get('panCardNumber').patchValue(null);
      } else {
        const PAN = this.controls.panCardNumber.value.toUpperCase();
        this.leadForm.get('panCardNumber').patchValue(PAN);
      }
      if (this.controls.panType.value == '') {
        this.leadForm.get('panType').patchValue(null);
        this.controls.panImage.patchValue('')
      }

      const leadData = this.leadForm.value;

      this.leadService.addLead(leadData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Lead Added Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {
          console.log(error.error.message);
          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        });
    } else if (this.data.action == 'edit') {
      if (this.controls.panType.value == '') {
        this.leadForm.get('panType').patchValue(null);
        this.controls.panImage.patchValue('')
      }
      if (this.controls.leadSourceId.value == "") {
        this.leadForm.get('leadSourceId').patchValue(null);
      } else {
        this.leadForm.get('leadSourceId').patchValue(Number(this.controls.leadSourceId.value));
      }
      if (this.controls.statusId.valid) {
        this.leadForm.get('statusId').patchValue(Number(this.controls.statusId.value));
      }
      if (this.controls.pinCode.valid) {
        this.leadForm.get('pinCode').patchValue(Number(this.controls.pinCode.value));
      }
      const leadData = this.leadForm.value;
      console.log('edit')
      this.leadService.editLead(this.data.id, leadData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Lead Edited Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      });
    }

  }

  commentBox() {
    if (this.controls.statusId.value == 5 || this.controls.statusId.value == 2) {
      this.controls.comment.setValidators(Validators.required)
      this.controls.comment.updateValueAndValidity()
      this.showCommentBox = true
    } else {
      this.controls.comment.clearValidators()
      this.controls.comment.markAsUntouched()
      this.controls.comment.updateValueAndValidity()
      this.showCommentBox = false
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.closeModal();
    }
  }

}
