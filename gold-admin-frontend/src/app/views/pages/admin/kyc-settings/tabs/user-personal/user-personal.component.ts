import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserPersonalService } from '../../../../../../core/kyc-settings/services/user-personal.service';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { catchError, map, finalize } from 'rxjs/operators';
import { UserDetailsService } from '../../../../../../core/kyc-settings';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { WebcamDialogComponent } from '../../webcam-dialog/webcam-dialog.component';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../../partials/components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'kt-user-personal',
  templateUrl: './user-personal.component.html',
  styleUrls: ['./user-personal.component.scss']
})
export class UserPersonalComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  personalForm: FormGroup;
  occupations = [];
  customerDetails = this.userDetailsService.userData;
  // customerDetails = { customerId: 1, customerKycId: 2 }
  file: any;
  profile = '';
  signatureJSON = { url: null, isImage: false };
  minDate = new Date();
  @ViewChild("files", { static: false }) files;
  @ViewChild("signature", { static: false }) signature;
  @ViewChild("constitutionsDeed", { static: false }) constitutionsDeed;
  @ViewChild("gstCertificate", { static: false }) gstCertificate;

  images = { constitutionsDeed: [], gstCertificate: [] }

  constructor(private fb: FormBuilder, private userDetailsService: UserDetailsService,
    private userPersonalService: UserPersonalService,
    private sharedService: SharedService, private ref: ChangeDetectorRef,
    private toastr: ToastrService,
    private dialog: MatDialog) { }

  ngOnInit() {

    this.getOccupation();
    this.initForm();
  }

  initForm() {
    this.personalForm = this.fb.group({
      customerId: [this.customerDetails.customerId],
      customerKycId: [this.customerDetails.customerKycId],
      profileImage: ['', [Validators.required]],
      profileImg: ['', [Validators.required]],
      alternateMobileNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      gender: ['', [Validators.required]],
      spouseName: ['', [Validators.required]],
      martialStatus: ['', [Validators.required]],
      signatureProof: [null],
      signatureProofImg: [''],
      signatureProofFileName: [''],
      occupationId: [null],
      dateOfBirth: ['', [Validators.required]],
      age: [],
      moduleId: [this.customerDetails.moduleId],
      userType: [this.customerDetails.userType],
      email: [null],
      alternateEmail: [null],
      landLineNumber: [null],
      gstinNumber: [null],
      cinNumber: [null],
      constitutionsDeed: [[]],
      constitutionsDeedFileName: [],
      constitutionsDeedImg: [],
      gstCertificate: [[]],
      gstCertificateFileName: [],
      gstCertificateImg: [],
    })

    this.setFormValidation()
  }

  setFormValidation() {
    if (this.controls.moduleId.value == 3) {
      for (const key in this.personalForm.controls) {
        this.personalForm.controls[key].setValidators([]);
        this.personalForm.controls[key].updateValueAndValidity();
      }
      if (this.controls.userType.value == 'Individual') {
        this.controls.dateOfBirth.setValidators([Validators.required])
        this.controls.gender.setValidators([Validators.required])
        this.controls.dateOfBirth.updateValueAndValidity()
        this.controls.gender.updateValueAndValidity()
      } else {
        this.controls.gstinNumber.setValidators([Validators.required])
        this.controls.gstinNumber.updateValueAndValidity()
        this.controls.email.setValidators([Validators.required, Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')])
        this.controls.email.updateValueAndValidity()
        this.controls.alternateEmail.setValidators([Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')])
        this.controls.alternateEmail.updateValueAndValidity()
      }
    }
  }

  getOccupation() {
    this.userPersonalService.getOccupation().subscribe(res => {
      this.occupations = res.data;
    })
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
          customerId: this.controls.customerId.value
        }
        this.sharedService.uploadBase64File(res.imageAsDataUrl, params).subscribe(res => {
          this.personalForm.controls.profileImage.patchValue(res.uploadFile.path);
          this.personalForm.controls.profileImg.patchValue(res.uploadFile.URL);
          this.ref.detectChanges()
        })
      }
    });
  }

  getFileInfo(event, type: any) {
    this.file = event.target.files[0];
    // var name = event.target.files[0].name
    // var ext = name.split('.')
    if (this.sharedService.fileValidator(event)) {
      const params = {
        reason: 'customer',
        customerId: this.controls.customerId.value
      }
      this.sharedService.uploadFile(this.file, params).pipe(
        map(res => {
          if (type == "profile") {
            this.personalForm.controls.profileImage.patchValue(res.uploadFile.path);
            this.personalForm.controls.profileImg.patchValue(res.uploadFile.URL);

          } else if (type == "signature") {
            this.personalForm.get('signatureProofFileName').patchValue(event.target.files[0].name);
            this.personalForm.get('signatureProof').patchValue(res.uploadFile.path);
            this.personalForm.get('signatureProofImg').patchValue(res.uploadFile.URL);

            this.ref.detectChanges();
          }
          else if (type == "constitutionsDeed" && this.images.constitutionsDeed.length < 2) {
            this.images.constitutionsDeed.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
            // console.log(this.images)
            const temp = []
            this.images.constitutionsDeed.forEach(value => {
              temp.push(value.path)
            })
            this.personalForm.get('constitutionsDeedFileName').patchValue(res.uploadFile.originalname);
            this.personalForm.get('constitutionsDeed').patchValue(temp);
          } else if (type == "gstCertificate" && this.images.gstCertificate.length < 2) {
            this.images.gstCertificate.push({ path: res.uploadFile.path, URL: res.uploadFile.URL })
            // console.log(this.images)
            const temp = []
            this.images.gstCertificate.forEach(value => {
              temp.push(value.path)
            })
            this.personalForm.get('gstCertificateFileName').patchValue(res.uploadFile.originalname);
            this.personalForm.get('gstCertificate').patchValue(temp);
          } else {
            this.toastr.error("Cannot upload more than two images")
          }

        }), catchError(err => {
          this.toastr.error(err.error.message);
          throw err
        }),
        finalize(() => {
          if (this.files && this.files.nativeElement.value) this.files.nativeElement.value = '';
          if (this.signature && this.signature.nativeElement.value) this.signature.nativeElement.value = '';
          if (this.constitutionsDeed && this.constitutionsDeed.nativeElement.value) this.constitutionsDeed.nativeElement.value = '';
          if (this.gstCertificate && this.gstCertificate.nativeElement.value) this.gstCertificate.nativeElement.value = '';
        })
      ).subscribe()
    }
    // else {
    //   this.toastr.error('Upload Valid File Format');
    // }
  }

  public calculateAge(dateOfBirth: any) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.controls.age.patchValue(age);
    // this.ageValidation()
  }

  ageValidation() {
    if (this.controls.gender.value && this.controls.dateOfBirth.value) {
      if (this.controls.gender.value == 'm') {
        this.controls.age.setValidators(Validators.pattern('^0*(2[1-9]|[3-9][0-9]|100)$'))
      } else {
        this.controls.age.setValidators(Validators.pattern('^0*(1[89]|[2-9][0-9]|100)$'))
      }
      this.controls.age.markAsTouched()
      this.calculateAge(this.controls.dateOfBirth.value)
    }
  }

  submit() {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched()
      if (this.controls.profileImage.invalid) {
        this.toastr.error('Please upload a Profile Image');
      }
      return
    }

    const basicForm = this.personalForm.value;

    this.userPersonalService.personalDetails(basicForm).pipe(
      map(res => {

        if (res) {
          this.next.emit(true);
        }
      }),
      finalize(() => {
        // this.personalForm.get('signatureProof').patchValue(this.file.name);
      })
    ).subscribe();

  }

  get controls() {
    if (this.personalForm)
      return this.personalForm.controls;
  }

  previewImage(value) {

    const img = value
    let images = []
    images = [this.controls.profileImg.value, this.controls.signatureProofImg.value]

    images = images.filter(e => {
      let ext = this.sharedService.getExtension(e)
      return ext !== 'pdf' && e != ''
    })
    const index = images.indexOf(img)

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
          images: images,
          index: index,
        },
        width: "auto"
      })
    }
  }

  preview(value, formIndex) {
    let filterImage = []
    Object.keys(this.images).forEach(res => {
      Array.prototype.push.apply(filterImage, this.getURLArray(res));
    })
    var temp = []
    temp = filterImage.filter(e => {
      let ext = this.sharedService.getExtension(e)
      return ext !== 'pdf'
    })
    let index = temp.indexOf(value)
    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: temp,
        index: index
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

  removeImage() {
    this.personalForm.patchValue({
      signatureProof: null,
      signatureProofFileName: '',
      signatureProofImg: ''
    });

  }

  checkOccupation(event) {
    if (event.target.value == 'null') {
      this.controls.occupationId.patchValue(null)
    }
  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

  changeMaritalStatus() {
    this.controls.spouseName.reset()
  }

  removeImages(index, type) {
    if (type == 'constitutionsDeed') {
      this.images.constitutionsDeed.splice(index, 1);
      this.personalForm.get('constitutionsDeed').patchValue(this.getPathArray('constitutionsDeed'));
    }
    if (type == 'gstCertificate') {
      this.images.gstCertificate.splice(index, 1);
      this.personalForm.get('gstCertificate').patchValue(this.getPathArray('gstCertificate'));
    }
  }

  getPathArray(type: string) {
    const temp = []
    this.images[type].forEach(value => {
      temp.push(value.path)
    })
    return temp
  }

  getURLArray(type: string) {
    const temp = []
    this.images[type].forEach(value => {
      temp.push(value.URL)
    })
    return temp
  }
}
