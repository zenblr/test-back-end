import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { map, finalize } from 'rxjs/operators';
import { ImagePreviewDialogComponent } from '../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { AppliedKycService } from '../../../../../core/digi-gold-kyc/applied-kyc/service/applied-kyc.service';
import { ActivatedRoute } from '@angular/router';
import { LeadService } from '../../../../../core/lead-management/services/lead.service';

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

  constructor(
    public dialogRef: MatDialogRef<KycDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: any,
    private dialog: MatDialog,
    public fb: FormBuilder,
    public sharedService: SharedService,
    private toastr: ToastrService,
    private appliedKycService: AppliedKycService,
    private route: ActivatedRoute,
    private leadService: LeadService
  ) { }

  ngOnInit() {
    this.initForm()

    this.customerId = this.route.snapshot.paramMap.get("id");
    // console.log(this.customerId)
    if (this.customerId) {
      this.getKYCDetails()
      this.setPanAttachmentValidation()
      this.digiGoldKycForm.disable()
    }
    if (this.modalData.data) {
      // this.appliedKycService.kycData$.subscribe(res => {
      // console.log(res)
      this.digiGoldKycForm.patchValue(this.modalData.data)
      this.patchImage(this.modalData.data)
      // })
    }
  }

  getKYCDetails() {
    this.leadService.getLeadById(this.customerId).subscribe(res => {
      console.log(res.singleCustomer)
      this.digiGoldKycForm.patchValue(res.singleCustomer)
      this.digiGoldKycForm.patchValue({
        moduleId: 4,
        customerId: res.singleCustomer.id,
        panType: 'pan',
        status: null
      })
      this.patchImage(res.singleCustomer)
    })
  }

  initForm() {
    this.digiGoldKycForm = this.fb.group({
      panCardNumber: [, [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
      panFileName: [],
      panAttachment: [, [Validators.required]],
      moduleId: [4],
      userType: [],
      panType: ['pan'],
      panImage: [],
      dateOfBirth: [, [Validators.required]],
      age: [, [Validators.min(18), Validators.max(100)]],
      customerId: [],
      status: [],
      id: []
    })
  }

  setPanAttachmentValidation() {
    this.controls.panAttachment.setValidators([])
    this.controls.panAttachment.updateValueAndValidity()
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
      this.toastr.error('Upload Valid File Format');
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

  removeImage(event) {
    if (event) {
      const emptyPAN = { path: null, URL: null, fileName: null }
      this.images.pan = { ...emptyPAN };

      this.digiGoldKycForm.patchValue({
        panFileName: this.images.pan['fileName'],
        panAttachment: this.images.pan['path'],
        panImage: this.images.pan['path']
      });
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
      return this.digiGoldKycForm.markAllAsTouched()
    }
    this.appliedKycService.editKycDetails(this.digiGoldKycForm.getRawValue()).subscribe()
    console.log(this.digiGoldKycForm.getRawValue())
  }

  previewPdf() {

  }

}
