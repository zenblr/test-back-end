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

  constructor(private fb: FormBuilder, private userDetailsService: UserDetailsService,
    private userPersonalService: UserPersonalService,
    private sharedService: SharedService, private ref: ChangeDetectorRef,
    private toastr: ToastrService,
    private dialog: MatDialog) { }

  ngOnInit() {
    // console.log(this.signature)
    this.getOccupation();
    this.initForm();
  }

  initForm() {
    this.personalForm = this.fb.group({
      customerId: [this.customerDetails.customerId],
      customerKycId: [this.customerDetails.customerKycId],
      profileImage: ['', [Validators.required]],
      alternateMobileNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      gender: ['', [Validators.required]],
      spouseName: ['', [Validators.required]],
      martialStatus: ['', [Validators.required]],
      signatureProof: [''],
      signatureProofFileName: [''],
      occupationId: [null],
      dateOfBirth: ['', [Validators.required]],
      age: []
    })
  }

  getOccupation() {
    this.userPersonalService.getOccupation().subscribe(res => {
      this.occupations = res;
    }, err => {
      // console.log(err);
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
        this.sharedService.uploadBase64File(res.imageAsDataUrl).subscribe(res => {
          console.log(res)
          this.profile = res.uploadFile.URL
          this.personalForm.get('profileImage').patchValue(this.profile);
          this.ref.detectChanges()
        })
        // this.controls.
      }
    });
  }

  getFileInfo(event, type: any) {
    this.file = event.target.files[0];
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      console.log(this.file, type);
      this.sharedService.uploadFile(this.file).pipe(
        map(res => {
          if (type == "profile") {
            this.profile = res.uploadFile.URL;
            // this.personalForm.get('profileImage').patchValue(event.target.files[0].name);
            this.personalForm.get('profileImage').patchValue(this.profile);

          } else if (type == "signature") {
            this.signatureJSON = { url: null, isImage: false };
            this.signatureJSON.url = res.uploadFile.URL;
            this.signatureJSON.isImage = true;
            this.personalForm.get('signatureProofFileName').patchValue(event.target.files[0].name);
            this.personalForm.get('signatureProof').patchValue(this.signatureJSON.url);

            this.ref.detectChanges();
          }

        }), catchError(err => {
          this.toastr.error(err.error.message);
          throw err
        }),
        finalize(() => {
          this.files.nativeElement.value = '';
          this.signature.nativeElement.value = '';
        })
      ).subscribe()
    } else {
      this.toastr.error('Upload Valid File Format');
    }
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
    if (this.controls.gender.value) {
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
        // console.log(res);
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
    // let temp = [];
    // temp.push(this.controls.profileImage.value, this.controls.signatureProof.value);
    // var filteredArray = temp.filter(value => value != '');

    // let index = temp.indexOf(value);
    // this.dialog.open(ImagePreviewDialogComponent, {
    //   data: {
    //     images: filteredArray,
    //     index: index
    //   },
    //   width: "auto"
    // })
  }
}
