import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { map, finalize } from 'rxjs/operators';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { AppliedKycService } from '../../../../../core/digi-gold-kyc/applied-kyc/service/applied-kyc.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';
import { CustomerClassificationService } from '../../../../../core/kyc-settings/services/customer-classification.service';
import { PdfViewerComponent } from '../../../../partials/components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'kt-kyc-details',
  templateUrl: './kyc-details.component.html',
  styleUrls: ['./kyc-details.component.scss']
})
export class KycDetailsComponent implements OnInit {
  digiGoldKycForm: FormGroup;
  maxDate = new Date();
  images = { pan: {} };
  @ViewChild("pan", { static: false }) pan;
  customerId: string;
  id: string;
  isEditable: boolean;
  kycStage: string;
  reasonsList: any;
  isPanVerified = false;
  constructor(
    public dialogRef: MatDialogRef<KycDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: any,
    private dialog: MatDialog,
    public fb: FormBuilder,
    public sharedService: SharedService,
    private toastr: ToastrService,
    private appliedKycService: AppliedKycService,
    private route: ActivatedRoute,
    private leadService: LeadService,
    private router: Router,
    private custClassificationService: CustomerClassificationService,
  ) { }

  ngOnInit() {
    this.initForm()

    this.kycStage = (this.router.url).split('/')[4]
    if (this.kycStage == 'apply') {
      this.isEditable = true
      this.controls.status.disable()
      this.setApplyValidation()
    }
    if (this.kycStage == 'edit') {
      this.getReasonsList()
      this.isEditable = false
      this.digiGoldKycForm.disable()
      this.controls.status.enable()
      this.controls.reasonForDigiKyc.enable()
      this.controls.reason.enable()
      this.setEditValidation()
    }

    this.customerId = this.route.snapshot.paramMap.get("customerId");
    this.id = this.route.snapshot.queryParamMap.get("id");

    if (this.customerId) {
      this.getKYCDetails()
    }
    if (this.modalData.data) {
      this.digiGoldKycForm.patchValue(this.modalData.data)
      this.patchImage(this.modalData.data)
    }
  }

  getKYCDetails() {
    this.leadService.getLeadById(this.customerId).subscribe(res => {
      this.digiGoldKycForm.patchValue(res.singleCustomer)
      this.digiGoldKycForm.patchValue({
        moduleId: 4,
        customerId: res.singleCustomer.id,
        panType: 'pan',
        status: null,
        id: Number(this.id)
      })
      this.patchImage(res.singleCustomer)
    })
  }

  initForm() {
    this.digiGoldKycForm = this.fb.group({
      panCardNumber: [, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      panFileName: [],
      panAttachment: [],
      moduleId: [4],
      userType: [],
      panType: ['pan'],
      panImage: [, [Validators.required]],
      dateOfBirth: [, [Validators.required]],
      age: [, [Validators.min(18), Validators.max(100)]],
      customerId: [],
      status: [],
      id: [],
      reasonForDigiKyc: [],
      reason: [],
      firstName: [],
      lastName: [],
      isPanVerified: [false],

    })
  }

  setPanAttachmentValidation() {
    // this.controls.panAttachment.setValidators([])
    // this.controls.panAttachment.updateValueAndValidity()
    // this.controls.status.setValidators([Validators.required])
    // this.controls.status.updateValueAndValidity()
  }

  setApplyValidation() {
    // this.controls.panAttachment.setValidators([Validators.required])
    // this.controls.panAttachment.updateValueAndValidity()
  }

  setEditValidation() {
    // this.controls.panAttachment.setValidators([])
    // this.controls.panAttachment.updateValueAndValidity()
    this.controls.status.setValidators([Validators.required])
    this.controls.status.updateValueAndValidity()
  }

  setReasonValidation() {
    const { status, reasonForDigiKyc, reason } = this.controls
    if (status.value !== 'approved') {
      reason.setValidators([Validators.required])
      reason.updateValueAndValidity()
    } else {
      reason.setValidators([])
      reason.updateValueAndValidity()
      this.unsetTextReasonValidation()
      setTimeout(() => {
        reason.reset()
        // reasonForDigiKyc.markAsTouched()
      })
    }
  }

  get controls() {
    return this.digiGoldKycForm.controls;
  }

  action() {
    this.dialogRef.close();
  }

  ageValidation() {
    if (this.controls.dateOfBirth.value) {
      this.controls.dateOfBirth.markAsTouched()
      this.calculateAge(this.controls.dateOfBirth.value)
    }
  }

  public calculateAge(dateOfBirth: any) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.controls.age.patchValue(age);
    this.controls.age.markAsTouched()
  }

  patchImage(data) {
    if (data.panImage) {
      let imageObj = { path: data.panImage, URL: data.panImg, fileName: null }
      this.images.pan = { ...imageObj }
    }
  }

  uploadFile(event) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {

      if (event.target.files[0]) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.digiGoldKycForm.patchValue({
            panAttachment: reader.result,
            // panAttachImg: reader.result
            panFileName: name
          });
          this.getbase64ImageUrl(this.controls.panAttachment.value)
        }
        reader.readAsDataURL(file);
      }
    } else {
      // this.toastr.error('Upload Valid File Format');
    }
    event.target.value = ''
  }

  getbase64ImageUrl(base64Image) {
    const params = {
      reason: 'lead'
    }
    this.sharedService.uploadBase64File(base64Image, params).pipe(
      map(res => {
        if (res) {
          this.controls.panImage.patchValue(res.uploadFile.path);
          // this.controls.panAttachment.patchValue(res.uploadFile.URL);

          const panObj = { path: res.uploadFile.path, URL: res.uploadFile.URL, fileName: res.uploadFile.originalname }
          this.images.pan = { ...panObj }
        }
      }),
      finalize(() => {
        if (this.pan && this.pan.nativeElement.value) this.pan.nativeElement.value = ''
      })
    ).subscribe();
  }

  getPanDetails() {
    this.leadService.getPanDetailsFromKarza(this.controls.panAttachment.value, this.customerId).subscribe(res => {
      this.controls.panCardNumber.patchValue(res.data.idNumber)
      this.controls.isPanVerified.patchValue(res.data.isPanVerified)
      if (res.data.name) {
        let name = res.data.name.split(" ")
        let lastName = name[name.length - 1]
        name.splice(name.length - 1, 1)
        this.controls.firstName.patchValue(name.join(" "))
        this.controls.lastName.patchValue(lastName)
      }
      if (res.data.dob) {
        let dateString = res.data.dob;
        let dateParts = dateString.split("/");
        let dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        this.controls.dateOfBirth.patchValue(dateObject);
      }
      this.controls.panCardNumber.disable()
      this.controls.dateOfBirth.disable()
    })
  }
  uploadPanImg(file) {
    const params = {
      reason: 'lead'
    }
    this.sharedService.uploadFile(file, params).pipe(
      map(res => {
        if (res) {
          this.controls.panImage.patchValue(res.uploadFile.path);
          this.controls.panAttachment.patchValue(res.uploadFile.URL);
          console.log(res.uploadFile.URL)
          const panObj = { path: res.uploadFile.path, URL: res.uploadFile.URL, fileName: res.uploadFile.originalname }
          this.images.pan = { ...panObj }
          if (this.controls.panType.value == 'pan')
            this.getPanDetails()
        }
      }),
      finalize(() => {
        if (this.pan && this.pan.nativeElement.value) this.pan.nativeElement.value = ''
        //event.target.value = ''
      })
    ).subscribe();
  }
  getImageValidationForKarza(event) {
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
        this.uploadPanImg(event.target.files[0])
      }
      event.target.value = ''
      return
    }
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
          this.toastr.error('Image of height and width should be less than 3000px')
          event.target.value = ''
        } else {
          this.uploadPanImg(event.target.files[0])
        }
      }, 1000);
    }
    // return data
  }

  testUpload(event) {
    const file = event.target.files[0];
    if (this.sharedService.fileValidator(event, 'image')) {
      let data = this.getImageValidationForKarza(event)
    } else {
      this.toastr.error('Upload Valid File Format');
    }
    //event.target.value = ''
  }

  removeImage(event) {
    if (event) {
      const emptyPAN = { path: null, URL: null, fileName: null }
      this.images.pan = { ...emptyPAN };

      this.digiGoldKycForm.patchValue({
        panFileName: this.images.pan['fileName'],
        panAttachment: this.images.pan['path'],
        panImage: this.images.pan['path']
      });
      this.controls.dateOfBirth.reset()
      this.controls.panCardNumber.reset()
    }
  }

  preview(value) {
    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: [value],
        index: 0
      },
      width: "auto"
    })
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

  submit() {
    if (this.digiGoldKycForm.invalid) {
      console.log(this.digiGoldKycForm.getRawValue())
      return this.digiGoldKycForm.markAllAsTouched()
    }
    if (this.kycStage == 'edit') {
      if (this.controls.reason.value && (this.controls.reason.value).toString().toLowerCase() != "other") {
        this.patchToReason()
      }
      // return console.log(this.digiGoldKycForm.getRawValue())
      this.appliedKycService.editDigiGoldKyc(this.digiGoldKycForm.getRawValue())
        .pipe(finalize(() => {
          if (this.controls.reason.value && (this.controls.reason.value).toString().toLowerCase() != "other") {
            this.unpatchToReason()
          }
        }))
        .subscribe(res => {
          this.toastr.success(res.message)
          this.router.navigate(['/admin/digi-gold/applied-kyc-digi-gold'])
        })
    }
    if (this.kycStage == 'apply') {
      this.appliedKycService.applyDigiGoldKyc(this.digiGoldKycForm.getRawValue())
        .subscribe(res => {
          this.toastr.success(res.message)
          this.router.navigate(['/admin/lead-management'])
        })
      // console.log(this.digiGoldKycForm.getRawValue())
    }
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

  getReasonsList() {
    this.custClassificationService.getReasonsList().pipe(
      map(res => this.reasonsList = res.data))
      .subscribe()
  }

  selectReason() {
    const { reason, reasonForDigiKyc } = this.controls
    if ((reason.value).toString().toLowerCase() == "other") {
      this.setTextReasonValidation()
      setTimeout(() => {
        reasonForDigiKyc.reset()
      })
    } else {
      this.unsetTextReasonValidation()
    }
  }

  setTextReasonValidation() {
    this.controls.reasonForDigiKyc.setValidators([Validators.required])
    this.controls.reasonForDigiKyc.updateValueAndValidity()
  }

  unsetTextReasonValidation() {
    this.controls.reasonForDigiKyc.setValidators([])
    this.controls.reasonForDigiKyc.updateValueAndValidity()
  }

  patchToReason() {
    this.controls.reasonForDigiKyc.patchValue(this.controls.reason.value)
  }

  unpatchToReason() {
    this.controls.reasonForDigiKyc.patchValue(null)
  }
}
