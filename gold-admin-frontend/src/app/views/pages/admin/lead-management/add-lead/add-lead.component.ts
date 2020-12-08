import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// material
import { DialogData } from '../../../material/popups-and-modals/dialog/dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
// services
import { SharedService } from '../../../../../core/shared/services/shared.service';
// components
import { ToastrComponent } from '../../../../../views/partials/components/toastr/toastr.component';
import { map, catchError, finalize } from 'rxjs/operators';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { LeadSourceService } from '../../../../../core/masters/lead-source/services/lead-source.service';
import { RolesService } from '../../../../../core/user-management/roles';
import { PdfViewerComponent } from '../../../../partials/components/pdf-viewer/pdf-viewer.component';
import { ToastrService } from 'ngx-toastr';
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
  modules = [];
  @ViewChild("file", { static: false }) file;

  constructor(
    public dialogRef: MatDialogRef<AddLeadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private leadService: LeadService,
    private dialog: MatDialog,
    private leadSourceService: LeadSourceService,
    private ref: ChangeDetectorRef,
    private roleService: RolesService,
    private toaster: ToastrService,
  ) {
    this.details = this.sharedService.getDataFromStorage()

  }

  ngOnInit() {
    this.formInitialize();
    this.setForm();
    this.getLeadSourceWithoutPagination();
    this.getInternalBranhces();
    this.getStates();
    this.getStatus();
    this.getModules();
    if (this.details.userDetails.userTypeId != 4) {
      this.disable();
    }


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

          this.controls.form60Image.reset()
          this.controls.form60Image.setValidators([])
          this.controls.form60Image.updateValueAndValidity()
          this.controls.panImage.reset()
          this.controls.panImage.setValidators(Validators.required)
          this.controls.panImage.updateValueAndValidity()
        } else {
          this.controls.panCardNumber.reset()
          this.controls.panCardNumber.clearValidators()
          this.controls.panCardNumber.updateValueAndValidity()

          this.controls.form60Image.reset()
          this.controls.panImage.reset()
          this.controls.panImage.setValidators([])
          this.controls.panImage.updateValueAndValidity()
          this.controls.form60Image.setValidators(Validators.required)
          this.controls.form60Image.updateValueAndValidity()
        }
        // this.controls.panImage.reset()
        // this.controls.panImage.setValidators(Validators.required)
        // this.controls.panImage.updateValueAndValidity()
      } else {
        this.controls.panImage.clearValidators()
        this.controls.panImage.updateValueAndValidity()
        this.controls.panImage.reset()
        this.controls.panImage.patchValue(null)

        this.controls.panCardNumber.clearValidators()
        this.controls.panCardNumber.updateValueAndValidity()
        this.controls.panCardNumber.reset()

        this.controls.panImg.clearValidators()
        this.controls.panImg.updateValueAndValidity()
        this.controls.panImg.reset()

        this.controls.form60Image.clearValidators()
        this.controls.form60Image.updateValueAndValidity()
        this.controls.form60Image.reset()

        this.controls.form60Img.clearValidators()
        this.controls.form60Img.updateValueAndValidity()
        this.controls.form60Img.reset()
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
      panImage: [null],
      panImg: [null],
      comment: [''],
      leadSourceId: [null],
      source: [''],
      moduleId: [, [Validators.required]],
      form60Image: [],
      form60Img: []
    });
    this.getCities()
  }

  setForm() {
    if (this.data.action == 'edit') {
      this.getLeadById(this.data['id']);
      this.modalTitle = 'Edit Lead'
      this.viewOnly = true;
      this.leadForm.controls.mobileNumber.disable()
      this.leadForm.controls.moduleId.disable()
      this.leadForm.controls.otp.disable()
    } else if (this.data.action == 'view') {
      this.getLeadById(this.data['id']);
      this.modalTitle = 'View Lead'
      this.leadForm.disable()
    } else if (this.data.action == 'assignBranch') {
      this.getLeadById(this.data['id']);
      this.modalTitle = 'Assign Branch';
      Object.keys(this.controls).forEach(res => {
        this.controls[res].setValidators([])
        this.controls[res].updateValueAndValidity()
      })
      this.controls.internalBranchId.setValidators([Validators.required])
      this.controls.internalBranchId.updateValueAndValidity()
      this.disableAssignBranch()
    }
    else {
      this.modalTitle = 'Add New Lead'
    }
  }

  getInternalBranhces() {
    const cityId = this.data.action == 'assignBranch' ? this.controls.cityId.value : null
    this.leadService.getInternalBranhces({ cityId }).subscribe(res => {
      this.branches = res.data;
      // const branchExists = this.branches.find(e => e.id === this.controls.internalBranchId.value)
      // if (!branchExists) {
      //   this.controls.internalBranchId.reset();
      //   this.controls.internalBranchId.patchValue('');
      // }
    });
  }

  getBranchFromCity() {
    if (this.data.action == 'edit') this.getInternalBranhces()
  }

  getLeadSourceWithoutPagination() {
    this.leadSourceService.getLeadSourceWithoutPagination().subscribe(res => {
      this.leadSources = res.data
    })
  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.data;
      this.ref.detectChanges()
    });
  }

  getCities() {
    const stateId = this.controls.stateId.value;
    this.sharedService.getCities(stateId).subscribe(res => {
      this.cities = res.data;
      this.ref.detectChanges()
      const cityExists = this.cities.find(e => e.id === this.controls.cityId.value)
      if (!cityExists) {
        this.controls.cityId.reset();
        this.controls.cityId.patchValue('');
      }
    });
  }

  getModules() {
    const data = {
      isFor: 'lead'
    }
    this.roleService.getAllModuleAppraiser(data).pipe(map(res => {
      this.modules = res;
    })).subscribe()
  }

  getStatus() {
    this.leadService.getStatus().pipe(
      map(res => {
        this.status = res.data;
      })
    ).subscribe();
  }

  getLeadById(id) {
    this.leadService.getLeadById(id).subscribe(res => {
      this.leadForm.patchValue(res.singleCustomer);
      this.leadForm.patchValue({ panImage: res.singleCustomer.panImage })
      this.leadForm.patchValue({ panImg: res.singleCustomer.panImg })

      this.getCities();
      this.commentBox()
      if (this.data.action == 'assignBranch') {
        this.controls.statusId.patchValue(1)
      }
    },
      error => {
        this.toastr.errorToastr(error.error.message);
      });
  }

  sendOTP() {
    const mobileNumber = this.controls.mobileNumber.value;
    const firstName = this.controls.firstName.value;
    const lastName = this.controls.lastName.value;

    if (this.controls.firstName.invalid || this.controls.lastName.invalid) {
      this.controls.firstName.markAsTouched()
      this.controls.lastName.markAsTouched()
      return
    }

    this.leadService.sendOtp({ mobileNumber, firstName, lastName, type: 'lead' }).subscribe(res => {
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
      type: 'lead'
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
      return this.toaster.error('Mobile number not verified!')
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
    const firstName = this.controls.firstName.value;
    const lastName = this.controls.lastName.value;
    const mobileNumber = this.controls.mobileNumber.value;
    // use send function OTP for resend OTP
    this.leadService.sendOtp({ mobileNumber, firstName, lastName, type: 'lead' }).subscribe(res => {
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
    if (this.sharedService.fileValidator(event)) {
      const params = {
        reason: 'lead'
      }
      this.sharedService.uploadFile(event.target.files[0], params).pipe(
        map(res => {
          if (res) {
            // this.controls.form60.patchValue(event.target.files[0].name)
            let formControl = this.getFormControlPanForm60()
            this.controls[formControl.path].patchValue(res.uploadFile.path)
            this.controls[formControl.URL].patchValue(res.uploadFile.URL)

            // this.controls.panImg.patchValue(res.uploadFile.URL)
          }
        }),
        catchError(err => {
          if (err.error.message) this.toastr.errorToastr(err.error.message)
          throw err
        }),
        finalize(() => {
          if (this.file && this.file.nativeElement.value) this.file.nativeElement.value = '';
          event.target.value = ''
        })
      ).subscribe()
    } else {
      event.target.value = ''
    }
  }

  preview(img) {
    // const img = this.controls.panImg.value
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
          modal: true
        },
        width: "auto"
      })
    }

  }

  remove() {
    let formControl = this.getFormControlPanForm60()
    this.controls[formControl.path].patchValue(null)
    this.controls[formControl.URL].patchValue(null)

    // this.controls.panImg.patchValue(null)
  }
  disable() {
    this.leadForm.controls.internalBranchId.disable();
    // this.leadForm.controls.stateId.disable();
    // this.leadForm.controls.cityId.disable();
  }
  enable() {
    this.leadForm.controls.internalBranchId.enable();
    // this.leadForm.controls.stateId.enable();
    ///this.leadForm.controls.cityId.enable();
  }
  onSubmit() {
    if (this.data.action == 'add') {
      // console.log(this.leadForm.getRawValue())
      // return
      if (this.leadForm.invalid || !this.isMobileVerified || this.mobileAlreadyExists) {
        this.checkforVerfication()
        this.leadForm.markAllAsTouched();
        if (this.controls.panImage.invalid) {
          if (this.controls.panType.value == 'pan') {
            this.toastr.errorToastr('Upload PAN Image')
          } else if (this.controls.panType.value == 'form60') {
            this.toastr.errorToastr('Upload Form 60 Image')
          }
        }

        return
      }

      if (this.controls.leadSourceId.value == null) {
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
        this.controls.panImage.patchValue(null)
      }
      this.enable();
      const leadData = this.leadForm.value;

      this.leadService.addLead(leadData).subscribe(res => {

        if (res) {
          const msg = 'Lead Added Successfully';
          this.toastr.successToastr(msg);
          this.dialogRef.close(true);
        }
      },
        error => {

          const msg = error.error.message;
          this.toastr.errorToastr(msg);
        }, () => {
          if (this.details.userDetails.userTypeId != 4) {
            this.disable();
          }
        }
      );
    } else if (this.data.action == 'edit' || this.data.action == 'assignBranch') {
      // if (this.data.action == 'assignBranch') this.leadForm.enable()
      if (this.leadForm.invalid) {
        // this.checkforVerfication()
        this.leadForm.markAllAsTouched();
        if (this.controls.panImage.invalid) {
          if (this.controls.panType.value == 'pan') {
            this.toastr.errorToastr('Upload PAN Image')
          } else if (this.controls.panType.value == 'form60') {
            this.toastr.errorToastr('Upload Form 60 Image')
          }
        }

        return
      }

      if (this.controls.panType.value == '') {
        this.leadForm.get('panType').patchValue(null);
        this.controls.panImage.patchValue(null)
      }
      if (this.controls.leadSourceId.value == null) {
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
      this.enable();
      const leadData = this.leadForm.value;

      if (this.data.action == 'edit') {
        this.leadService.editLead(this.data.id, leadData)
          .pipe(
            map(() => {
              const msg = 'Lead Edited Successfully';
              this.toastr.successToastr(msg);
              this.dialogRef.close(true);
            }),
            finalize(() => {
              if (this.details.userDetails.userTypeId != 4) this.disable();
            })).subscribe();
      }

      if (this.data.action == 'assignBranch') {
        console.log({ customerId: this.data.id, ...leadData })
        this.leadService.assignBranch({ customerId: this.data.id, ...leadData })
          .pipe(
            map(() => {
              const msg = 'Branch Assigned Successfully';
              this.toastr.successToastr(msg);
              this.dialogRef.close(true);
            }),
            finalize(() => {
              this.disableAssignBranch()
            })).subscribe();
      }
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
    this.scrollToBottom()
  }

  scrollToBottom() {
    setTimeout(() => {
      var container = document.getElementById('container')
      container.scrollTop = container.scrollHeight + 100
    })
    // this.ref.detectChanges()
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

  patchStateCity(internalBranchId) {
    if (this.data.action != 'assignBranch') {
      this.leadService.patchStateCityAdmin(internalBranchId).pipe(
        map(res => {
          this.leadForm.patchValue({
            stateId: res.stateId,
            cityId: res.cityId
          })
          this.getCities()
        })
      ).subscribe()
    }
  }

  disableAssignBranch() {
    this.leadForm.disable()
    this.leadForm.controls.internalBranchId.enable()
    // this.leadForm.controls.statusId.enable()
    // this.leadForm.controls.comment.enable()
    // this.leadForm.controls.panCardNumber.enable()
    // this.leadForm.controls.panType.enable()
    // this.leadForm.controls.form60.enable()
    // this.leadForm.controls.panImage.enable()
    // this.leadForm.controls.panImg.enable()
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

  changePanType() {
    let panType = this.controls.panType.value
    if (panType) {
      if (panType === 'pan') {
        this.controls.form60Image.patchValue(null)
        this.controls.form60Img.patchValue(null)
      }
      if (panType === 'form60') {
        this.controls.panImage.patchValue(null)
        this.controls.panImg.patchValue(null)
      }
    }
  }
}
