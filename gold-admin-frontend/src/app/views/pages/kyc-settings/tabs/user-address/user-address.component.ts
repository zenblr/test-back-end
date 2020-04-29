import { Component, OnInit, EventEmitter, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserAddressService, UserDetailsService } from '../../../../../core/kyc-settings';
import { ToastrComponent } from '../../../../partials/components';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';
import { MatCheckbox } from '@angular/material';

@Component({
  selector: 'kt-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.scss']
})
export class UserAddressComponent implements OnInit {

  identityForm: FormGroup;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  file: any;

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent
  states = [];
  cities0 = [];
  cities1 = [];
  addressProofs = [];
  identityProofs = [];
  images = { identityProof: [], residential: [], permanent: [] };
  // customerDetails = this.userDetailsService.userData;
  customerDetails = { customerId: 1, customerKycId: 2, stateId: 2, cityId: 5, pinCode: '123456' }

  constructor(
    private fb: FormBuilder,
    private userAddressService: UserAddressService,
    private userDetailsService: UserDetailsService,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initForm();
    console.log(this.userDetailsService.userData)
    this.getStates();
    this.getIdentityType();
    this.getAddressProofType()
  }

  initForm() {
    this.identityForm = this.fb.group({
      customerId: [this.customerDetails.customerId],
      customerKycId: [this.customerDetails.customerKycId],
      identityTypeId: ['', [Validators.required]],
      identityProof: ['', [Validators.required]],
      address: this.fb.array([
        this.fb.group({
          addressType: ['permanent'],
          addressProofTypeId: ['', [Validators.required]],
          address: ['', [Validators.required]],
          stateId: [this.customerDetails.stateId, [Validators.required]],
          cityId: [this.customerDetails.cityId, [Validators.required]],
          pinCode: [this.customerDetails.pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: ['', [Validators.required]]
        }),
        this.fb.group({
          addressType: ['residential'],
          addressProofTypeId: ['', [Validators.required]],
          address: ['', [Validators.required]],
          stateId: ['', [Validators.required]],
          cityId: ['', [Validators.required]],
          pinCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: ['', [Validators.required]]
        })
      ])
    });
    this.getCities(0)
  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      console.log(res);
      this.identityProofs = res;
    }, err => {
      console.log(err);
    })
  }

  getAddressProofType() {
    this.userAddressService.getAddressProofType().subscribe(res => {
      console.log(res);
      this.addressProofs = res;
    }, err => {
      console.log(err);
    })
  }

  getFileInfo(event, type: any) {
    this.file = event.target.files[0];
    // console.log(type);
    // console.log(this.addressControls)
    this.sharedService.uploadFile(this.file).pipe(
      map(res => {
        if (type == "identityProof") {
          this.images.identityProof.push(res.uploadFile.URL)
          this.identityForm.get('identityProof').patchValue(event.target.files[0].name);
        } if (type == 0) {
          this.images.residential.push(res.uploadFile.URL)
          this.addressControls.at(0)['controls'].addressProof.patchValue(event.target.files[0].name)
        } if (type == 1) {
          this.images.permanent.push(res.uploadFile.URL)
          this.addressControls.at(1)['controls'].addressProof.patchValue(event.target.files[0].name)
        }
        this.ref.detectChanges();
        // console.log(this.addressControls)
      }), catchError(err => {
        this.toastr.errorToastr(err.error.message);
        throw err
      })).subscribe()

  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.message;
    });
  }

  getCities(index) {
    console.log(index)
    const stateId = this.addressControls.controls[index]['controls'].stateId.value;
    // console.log(stateId)
    this.sharedService.getCities(stateId).subscribe(res => {
      if (index == 0) {
        this.cities0 = res.message;
      } else {
        this.cities1 = res.message;
      }
    });
  }

  submit() {

    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched()
      return
    }
    this.addressControls.at(1).enable();

    this.identityForm.patchValue({ identityProof: this.images.identityProof });

    this.addressControls.controls[0].patchValue({ addressProof: this.images.residential });

    this.addressControls.controls[1].patchValue({ addressProof: this.images.permanent });

    const data = this.identityForm.value;
    console.log(data)

    this.userAddressService.addressDetails(data).pipe(
      map(res => {
        if (res) {
          this.next.emit(true);
        }
        console.log(res);
      }),
    ).subscribe();

    // this.next.emit(true);


  }

  get controls() {
    return this.identityForm.controls;
  }

  get addressControls() {
    return (<FormArray>this.identityForm.controls.address as FormArray);

    // console.log(control);
    // return control.at(0) as FormGroup;

  }

  sameAddress(event: MatCheckbox) {
    if (event) {
      this.cities1 = this.cities0;
      this.images.permanent = this.images.residential
      this.addressControls.at(1).disable();
      this.addressControls.at(1).patchValue(this.addressControls.at(0).value)
      this.addressControls.at(1)['controls'].addressType.patchValue('residential')
    } else {
      this.cities1 = [];
      this.images.permanent = [];
      this.addressControls.at(1).reset();
      this.addressControls.at(1).enable();

    }
  }

}
