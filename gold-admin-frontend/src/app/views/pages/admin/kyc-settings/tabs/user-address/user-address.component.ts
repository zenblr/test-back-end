import { Component, OnInit, EventEmitter, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserAddressService, UserDetailsService } from '../../../../../../core/kyc-settings';
import { ToastrComponent } from '../../../../../partials/components';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { MatCheckbox, MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';

@Component({
  selector: 'kt-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.scss']
})
export class UserAddressComponent implements OnInit {

  identityForm: FormGroup;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  files: any;
  @ViewChild("identity", { static: false }) identity;
  @ViewChild("permanent", { static: false }) permanent;
  @ViewChild("residential", { static: false }) residential;

  states = [];
  cities0 = [];
  cities1 = [];
  addressProofs = [];
  identityProofs = [];
  images = { identityProof: [], residential: [], permanent: [] };
  imageId = { identityProof: [], residential: [], permanent: [] };
  customerDetails = this.userDetailsService.userData;
  sameAdd: boolean;
  // customerDetails = { customerId: 1, customerKycId: 2, stateId: 2, cityId: 5, pinCode: 123456 }

  constructor(
    private fb: FormBuilder,
    private userAddressService: UserAddressService,
    private userDetailsService: UserDetailsService,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private toastr: ToastrService,
    public dilaog: MatDialog,
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
      identityTypeId: [, [Validators.required]],
      identityProof: [[], [Validators.required]],
      identityProofImg: [[]],
      identityProofFileName: ['', [Validators.required]],
      identityProofNumber: ['', [Validators.required, Validators.minLength(12)]],
      address: this.fb.array([
        this.fb.group({
          addressType: ['permanent'],
          addressProofTypeId: ['', [Validators.required]],
          addressProofNumber: [],
          address: ['', [Validators.required]],
          stateId: [this.customerDetails.stateId, [Validators.required]],
          cityId: [this.customerDetails.cityId, [Validators.required]],
          pinCode: [this.customerDetails.pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: ['', [Validators.required]],
          addressProofImg: [],
          addressProofFileName: ['', [Validators.required]]
        }),
        this.fb.group({
          addressType: ['residential'],
          addressProofTypeId: ['', [Validators.required]],
          addressProofNumber: [],
          address: ['', [Validators.required]],
          stateId: ['', [Validators.required]],
          cityId: ['', [Validators.required]],
          pinCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: ['', [Validators.required]],
          addressProofImg: [],
          addressProofFileName: ['', [Validators.required]]
        })
      ])
    });
    this.identityForm.controls.identityTypeId.disable()
    this.getCities(0)
  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      this.identityProofs = res.filter(filter => filter.name == 'Aadhar Card');
    }, err => {
      console.log(err);
    })
  }

  getAddressProofType() {
    this.userAddressService.getAddressProofType().subscribe(res => {
      this.addressProofs = res;
    }, err => {
      console.log(err);
    })
  }

  getFileInfo(event, type: any) {
    this.files = event.target.files[0];
    // console.log(type);
    // console.log(this.addressControls)
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      const params = {
        reason: 'customer',
        customerId: this.controls.customerId.value
      }
      this.sharedService.uploadFile(this.files, params).pipe(
        map(res => {


          if (type == "identityProof" && this.images.identityProof.length < 2) {
            this.images.identityProof.push(res.uploadFile.URL)
            this.imageId.identityProof.push(res.uploadFile.id)
            // identityProofImg
            this.identityForm.patchValue({ identityProofImg: this.images.identityProof });
            this.identityForm.patchValue({ identityProof: this.imageId.identityProof });
            this.identityForm.get('identityProofFileName').patchValue(event.target.files[0].name);
          } else if (type == 1 && this.images.residential.length < 2) {
            this.imageId.residential.push(res.uploadFile.id)
            this.images.residential.push(res.uploadFile.URL)
            this.addressControls.controls[1].patchValue({ addressProof: this.imageId.residential });
            this.addressControls.controls[1].patchValue({ addressProofImg: this.images.residential });
            this.addressControls.at(1)['controls'].addressProofFileName.patchValue(event.target.files[0].name)
          } else if (type == 0 && this.images.permanent.length < 2) {
            this.images.permanent.push(res.uploadFile.URL)
            this.imageId.permanent.push(res.uploadFile.id)
            this.addressControls.controls[0].patchValue({ addressProof: this.imageId.permanent });
            this.addressControls.controls[0].patchValue({ addressProofImg: this.images.permanent });
            this.addressControls.at(0)['controls'].addressProofFileName.patchValue(event.target.files[0].name)
          } else {
            this.toastr.error("Cannot upload more than two images")
          }
          this.ref.detectChanges();
          // console.log(this.addressControls)
        }), catchError(err => {
          this.toastr.error(err.error.message);
          throw err
        }),
        finalize(() => {
          this.identity.nativeElement.value = '';
          this.permanent.nativeElement.value = '';
          this.residential.nativeElement.value = '';
        })
      ).subscribe()
    } else {
      this.toastr.error('Upload Valid File Format');
    }

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

  selectAadhar(){
    this.identityProofs.forEach(proof=>{
      if(proof.name == "Aadhar Card"){
        this.controls.identityTypeId.patchValue(proof.id)
      }
    })
  }

  submit() {
    console.log(this.identityForm)
    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched()
      return
    }
    this.addressControls.at(1).enable();
    this.identityForm.controls.identityTypeId.enable()



    const data = this.identityForm.value;
    console.log(data)
    this.userAddressService.addressDetails(data).pipe(
      map(res => {
        if (res) {
          this.next.emit(true);
        }
        console.log(res);
      }, finalize(() => {
        this.identityForm.controls.identityTypeId.disable()

      })),
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
      this.sameAdd = true
      this.cities1 = this.cities0;
      this.images.residential = this.images.permanent;
      this.addressControls.at(1).disable();
      this.addressControls.at(1).patchValue(this.addressControls.at(0).value)
      this.addressControls.at(1)['controls'].addressType.patchValue('residential')
    } else {
      this.sameAdd = false
      this.cities1 = [];
      this.images.residential = [];
      this.addressControls.at(1).reset();
      this.addressControls.at(1)['controls'].addressType.patchValue('residential')
      this.addressControls.at(1).enable();

    }
  }

  removeImages(index, type) {
    // console.log(index, type)
    if (type == 'identityProof') {
      this.images.identityProof.splice(index, 1);
      this.imageId.identityProof.splice(index, 1);
      this.identityForm.get('identityProofFileName').patchValue('');
    } else if (type == 'residential') {
      this.images.residential.splice(index, 1);
      this.imageId.residential.splice(index, 1);
      this.addressControls.at(1)['controls'].addressProofFileName.patchValue('')
      if (this.sameAdd) {
        this.addressControls.at(0)['controls'].addressProofFileName.patchValue('')
      }
    } else if (type == 'permanent') {
      this.images.permanent.splice(index, 1);
      this.imageId.permanent.splice(index, 1);
      this.addressControls.at(0)['controls'].addressProofFileName.patchValue('')
    }
  }

  preview(value, formIndex) {
    // let filterImage = []
    // // filterImage = Object.values(this.images)
    // Object.keys(this.images).forEach(res => {

    //   Array.prototype.push.apply(filterImage, this.images[res]);
    // })
    // console.log(filterImage)
    // var temp = []
    // temp = filterImage.filter(el => {
    //   return el != ''
    // })
    // let index = temp.indexOf(value)
    // this.dilaog.open(ImagePreviewDialogComponent, {
    //   data: {
    //     images: temp,
    //     index: index
    //   },
    //   width: "auto"
    // })
  }

  // editImages(index, type) {

  //   if (type == 'identityProof') {
  //     this.images.identityProof.splice(index, 1, );
  //     this.identityForm.get('identityProof').patchValue('');
  //   } else if (type == 'residential') {
  //     this.images.residential.splice(index, 1);
  //     this.addressControls.at(0)['controls'].addressProof.patchValue('')
  //   } else if (type == 'permanent') {
  //     this.images.permanent.splice(index, 1);
  //     this.addressControls.at(1)['controls'].addressProof.patchValue('')
  //   }
  // }

  checkForAadhar() {
    if (this.addressControls.at(0).value.addressProofTypeId == 2) {
      this.images.permanent = [];
      this.imageId.permanent = [];
      Array.prototype.push.apply(this.images.permanent, this.images.identityProof)
      Array.prototype.push.apply(this.imageId.permanent, this.imageId.identityProof)
      this.addressControls.controls[0].patchValue({ addressProof: this.imageId.permanent });
      this.addressControls.controls[0].patchValue({ addressProofImg: this.images.permanent });
      this.addressControls.controls[0].patchValue({ addressProofNumber: this.controls.identityProofNumber.value });
      this.addressControls.controls[0].patchValue({ addressProofFileName: this.controls.identityProofFileName.value });
    } else {
      this.images.permanent = [];
      this.imageId.permanent = [];
      this.addressControls.controls[0].patchValue({ addressProof: this.imageId.permanent });
      this.addressControls.controls[0].patchValue({ addressProofImg: this.images.permanent });
      this.addressControls.controls[0].patchValue({ addressProofNumber: '' });
    }
    console.log(this.addressControls.at(0).value)
  }

}
