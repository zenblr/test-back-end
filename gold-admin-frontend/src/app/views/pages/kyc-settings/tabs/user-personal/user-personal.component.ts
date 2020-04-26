import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserPersonalService } from '../../../../../core/kyc-settings/services/user-personal.service';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'kt-user-personal',
  templateUrl: './user-personal.component.html',
  styleUrls: ['./user-personal.component.scss']
})
export class UserPersonalComponent implements OnInit {

  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  personalForm: FormGroup;
  occupations = [];
  // customerDetails = this.userDetailsService.userData;
  customerDetails = { customerId: 1, customerKycId: 2 }
  file: any;

  constructor(private fb: FormBuilder, private userPersonalService: UserPersonalService,
    private sharedService: SharedService, private ref: ChangeDetectorRef) { }

  ngOnInit() {
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
      occupationId: ['', [Validators.required]],


      // mobileNumber: [, [Validators.required, Validators.pattern('^[7-9][0-9]{9}$')]],
      // otp: [, [, Validators.pattern('^[0-9]{4}$')]],
      // referenceCode: [],
      // panCardNumber: ['', [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]],
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
    console.log(type);
    // console.log(this.addressControls)
    this.sharedService.uploadFile(this.file).pipe(
      map(res => {
        // if (type == "identityProof") {
        //   this.images.identityProof.push(res.uploadFile.URL)
        //   this.identityForm.get('identityProof').patchValue(event.target.files[0].name);
        //   this.ref
        // } if (type == 0) {
        //   this.images.residential.push(res.uploadFile.URL)
        //   this.addressControls.at(0)['controls'].addressProof.patchValue(event.target.files[0].name)
        // } if (type == 1) {
        //   this.images.permanent.push(res.uploadFile.URL)
        //   this.addressControls.at(1)['controls'].addressProof.patchValue(event.target.files[0].name)
        // }
        this.ref.detectChanges();
        // console.log(this.addressControls)
      }), catchError(err => {
        // this.toastr.errorToastr(err.error.message);
        throw err
      })).subscribe()
  }

  submit() {
    console.log(this.personalForm.value);


    // this.next.emit(true);
  }

  get controls() {
    return this.personalForm.controls;
  }

}
