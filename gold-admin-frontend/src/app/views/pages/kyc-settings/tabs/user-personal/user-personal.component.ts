import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserPersonalService } from '../../../../../core/kyc-settings/services/user-personal.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { catchError, map, finalize } from 'rxjs/operators';
import { UserDetailsService } from '../../../../../core/kyc-settings';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService) { }

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
      alternateMobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: ['', [Validators.required]],
      spouseName: ['', [Validators.required]],
      martialStatus: ['', [Validators.required]],
      signatureProof: ['', [Validators.required]],
      signatureProofFileName: ['', [Validators.required]],
      occupationId: [null],
      dateOfBirth: ['', [Validators.required]],
    })
  }

  getOccupation() {
    this.userPersonalService.getOccupation().subscribe(res => {
      this.occupations = res;
    }, err => {
      // console.log(err);
    })
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

  

  submit() {

    console.log(this.personalForm.value);

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

}
