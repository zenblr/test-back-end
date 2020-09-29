import { Component, OnInit, EventEmitter, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserAddressService, UserDetailsService } from '../../../../../../core/kyc-settings';
import { ToastrComponent } from '../../../../../partials/components';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { MatCheckbox, MatDialog } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { ImagePreviewDialogComponent } from '../../../../../partials/components/image-preview-dialog/image-preview-dialog.component';
import { PdfViewerComponent } from '../../../../../partials/components/pdf-viewer/pdf-viewer.component';

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

  identityFileNameArray = [];
  addressFileNameArray1 = [];
  addressFileNameArray2 = [];
  // customerDetails = { customerId: 1, customerKycId: 2, stateId: 2, cityId: 5, pinCode: 123456, moduleId: 3, userType: 'Corporate' }

  constructor(
    private fb: FormBuilder,
    private userAddressService: UserAddressService,
    private userDetailsService: UserDetailsService,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.initForm();

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
      identityProofFileName: [[], [Validators.required]],
      identityProofNumber: ['', [Validators.required, Validators.minLength(12)]],
      moduleId: [this.customerDetails.moduleId],
      userType: [this.customerDetails.userType],
      address: this.fb.array([
        this.fb.group({
          addressType: ['permanent'],
          addressProofTypeId: ['', [Validators.required]],
          addressProofNumber: ['', [Validators.required]],
          address: ['', [Validators.required]],
          stateId: [this.customerDetails.stateId, [Validators.required]],
          cityId: [this.customerDetails.cityId, [Validators.required]],
          pinCode: [this.customerDetails.pinCode, [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: ['', [Validators.required]],
          addressProofImg: [],
          addressProofFileName: [[], [Validators.required]],
        }),
        this.fb.group({
          addressType: ['residential'],
          addressProofTypeId: ['', [Validators.required]],
          addressProofNumber: ['', [Validators.required]],
          address: ['', [Validators.required]],
          stateId: ['', [Validators.required]],
          cityId: ['', [Validators.required]],
          pinCode: ['', [Validators.required, Validators.pattern('[1-9][0-9]{5}')]],
          addressProof: ['', [Validators.required]],
          addressProofImg: [],
          addressProofFileName: [[], [Validators.required]]
        })
      ])
    });

    if (this.identityForm.controls.moduleId.value == 3) {
      if (this.identityForm.controls.userType.value === 'Individual') {
        this.addressControls.removeAt(1)
      } else {
        const controls = this.addressControls.at(1)
        controls.get('addressType').patchValue('communication')
      }

      this.identityForm.controls.identityTypeId.disable()
      this.identityForm.controls.identityProof.disable()
      this.identityForm.controls.identityProofImg.disable()
      this.identityForm.controls.identityProofFileName.disable()
      this.identityForm.controls.identityProofNumber.disable()

    }

    this.identityForm.controls.identityTypeId.disable()
    this.getCities(0)
  }

  getIdentityType() {
    this.userAddressService.getIdentityType().subscribe(res => {
      this.identityProofs = res.data.filter(filter => filter.name == 'Aadhaar Card');
    }, err => {
      // console.log(err);
    })
  }

  getAddressProofType() {
    this.userAddressService.getAddressProofType().subscribe(res => {
      this.addressProofs = res.data;
    })
  }

  getFileInfo(event, type: any) {
    this.files = event.target.files[0];

    if (this.sharedService.fileValidator(event)) {
      const params = {
        reason: 'customer',
        customerId: this.controls.customerId.value
      }
      this.sharedService.uploadFile(this.files, params).pipe(
        map(res => {


          if (type == "identityProof" && this.images.identityProof.length < 2) {
            this.images.identityProof.push(res.uploadFile.URL)
            this.imageId.identityProof.push(res.uploadFile.path)
            // identityProofImg

            this.identityFileNameArray.push(event.target.files[0].name)

            this.identityForm.patchValue({ identityProofImg: this.images.identityProof });
            this.identityForm.patchValue({ identityProof: this.imageId.identityProof });
            this.identityForm.patchValue({ identityProofFileName: this.identityFileNameArray[this.identityFileNameArray.length - 1] });

          } else if (type == 1 && this.images.residential.length < 2) {
            this.imageId.residential.push(res.uploadFile.path)
            this.images.residential.push(res.uploadFile.URL)
            this.addressFileNameArray2.push(event.target.files[0].name)
            this.addressControls.controls[1].patchValue({ addressProof: this.imageId.residential });
            this.addressControls.controls[1].patchValue({ addressProofImg: this.images.residential });
            this.addressControls.controls[1].patchValue({ addressProofFileName: this.addressFileNameArray2[this.addressFileNameArray2.length - 1] });
          } else if (type == 0 && this.images.permanent.length < 2) {
            this.images.permanent.push(res.uploadFile.URL)
            this.imageId.permanent.push(res.uploadFile.path)
            this.addressFileNameArray1.push(event.target.files[0].name)
            this.addressControls.controls[0].patchValue({ addressProof: this.imageId.permanent });
            this.addressControls.controls[0].patchValue({ addressProofImg: this.images.permanent });
            this.addressControls.controls[0].patchValue({ addressProofFileName: this.addressFileNameArray1[this.addressFileNameArray1.length - 1] });
          } else {
            this.toastr.error("Cannot upload more than two images")
          }
          this.ref.detectChanges();

        }), catchError(err => {
          this.toastr.error(err.error.message);
          throw err
        }),
        finalize(() => {
          if (this.identity && this.identity.nativeElement.value) this.identity.nativeElement.value = '';
          if (this.permanent && this.permanent.nativeElement.value) this.permanent.nativeElement.value = '';
          if (this.residential && this.residential.nativeElement.value) this.residential.nativeElement.value = '';
        })
      ).subscribe()
    }
    // else {
    //   this.toastr.error('Upload Valid File Format');
    // }

  }

  getStates() {
    this.sharedService.getStates().subscribe(res => {
      this.states = res.data;
    });
  }

  getCities(index) {

    const stateId = this.addressControls.controls[index]['controls'].stateId.value;

    this.sharedService.getCities(stateId).subscribe(res => {
      if (index == 0) {
        this.cities0 = res.data;
      } else {
        this.cities1 = res.data;
      }
    });
  }

  selectAadhar() {
    this.identityProofs.forEach(proof => {
      if (proof.name == "Aadhaar Card") {
        this.controls.identityTypeId.patchValue(proof.id)
      }
    })
  }

  submit() {

    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched()
      return
    }

    if (this.addressControls.length > 1) {
      this.addressControls.at(1).enable();
    }

    if (this.controls.moduleId.value == 1) {
      this.identityForm.controls.identityTypeId.enable()
    }

    this.addressControls.at(0)['controls'].addressProofNumber.enable()

    const data = this.identityForm.value;

    this.userAddressService.addressDetails(data).pipe(
      map(res => {
        if (res) {
          this.next.emit(true);
        }

      }, finalize(() => {
        if (this.controls.moduleId.value == 1) {
          this.identityForm.controls.identityTypeId.disable()
        }
      })),
      catchError(err => {
        if (err.error.message)
          this.toastr.error(err.error.message);
        throw (err)
      })
    ).subscribe();

    // this.next.emit(true);


  }

  get controls() {
    return this.identityForm.controls;
  }

  get addressControls() {
    return (<FormArray>this.identityForm.controls.address as FormArray);
  }

  sameAddress(event: MatCheckbox) {
    this.addressControls.at(0).enable();
    if (event) {
      this.sameAdd = true
      this.cities1 = this.cities0;
      this.images.residential = this.images.permanent;
      this.addressControls.at(1).disable();
      this.addressControls.at(1).patchValue(this.addressControls.at(0).value)

      if (this.identityForm.controls.moduleId.value == 3) {
        if (this.identityForm.controls.userType.value === 'Corporate') {
          this.addressControls.at(1)['controls'].addressType.patchValue('communication')
        }
      }
      if (this.identityForm.controls.moduleId.value == 1) {
        this.addressControls.at(1)['controls'].addressType.patchValue('residential')
      }

      this.addressFileNameArray2 = this.addressFileNameArray1

      this.addressControls.at(1)['controls'].addressProofFileName.patchValue(this.addressFileNameArray2[this.addressFileNameArray2.length - 1])
    } else {
      this.sameAdd = false
      this.cities1 = [];
      this.images.residential = [];
      this.addressControls.at(1).reset();

      if (this.identityForm.controls.moduleId.value == 3) {
        if (this.identityForm.controls.userType.value === 'Corporate') {
          this.addressControls.at(1)['controls'].addressType.patchValue('communication')
        }
      }
      if (this.identityForm.controls.moduleId.value == 1) {
        this.addressControls.at(1)['controls'].addressType.patchValue('residential')
      }

      // this.addressControls.at(1)['controls'].addressType.patchValue('residential')
      this.addressControls.at(1).enable();
      this.addressFileNameArray2 = []
    }
    // this.addressControls.at(0)['controls'].addressProofNumber.disable()
  }

  removeImages(index, type) {

    if (type == 'identityProof') {
      this.images.identityProof.splice(index, 1);
      this.imageId.identityProof.splice(index, 1);
      this.identityFileNameArray.splice(index, 1);
      this.identityForm.get('identityProofFileName').patchValue(this.identityFileNameArray);
      // this.removeImageFromAddress(index)           // remove from permanent address
    } else if (type == 'residential') {
      this.images.residential.splice(index, 1);
      this.imageId.residential.splice(index, 1);
      this.addressFileNameArray2.splice(index, 1);
      this.addressControls.at(1)['controls'].addressProofFileName.patchValue(this.addressFileNameArray2)
    } else if (type == 'permanent') {
      this.images.permanent.splice(index, 1);
      this.imageId.permanent.splice(index, 1);
      this.addressFileNameArray1.splice(index, 1);
      this.addressControls.at(0)['controls'].addressProofFileName.patchValue(this.addressFileNameArray1)
      if (this.sameAdd) {
        this.addressFileNameArray2.splice(index, 1);
        this.addressControls.at(1)['controls'].addressProofFileName.patchValue(this.addressFileNameArray2)

      }
    }
  }

  removeImageFromAddress(index) {
    const addressControlZero = this.addressControls.at(0)
    if (addressControlZero.get('addressProofTypeId').value == 2) {
      this.images.permanent.splice(index, 1);
      this.imageId.permanent.splice(index, 1);
      this.addressFileNameArray1.splice(index, 1);
      this.addressControls.at(0)['controls'].addressProofFileName.patchValue(this.addressFileNameArray1)
    }
  }

  preview(value, formIndex) {
    let filterImage = []
    Object.keys(this.images).forEach(res => {
      Array.prototype.push.apply(filterImage, this.images[res]);
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

  checkForAadhar(index) {
    // console.log(index)
    if (this.identityForm.controls.moduleId.value == 3) {
      if (this.addressControls.at(0).value.addressProofTypeId == 2) {
        this.addressControls.controls[0].get('addressProofNumber').setValidators([Validators.required, Validators.pattern('^\\d{4}\\d{4}\\d{4}$')])
        this.addressControls.controls[0].get('addressProofNumber').updateValueAndValidity()
      } else {
        this.addressControls.controls[0].get('addressProofNumber').setValidators([Validators.required])
        this.addressControls.controls[0].get('addressProofNumber').updateValueAndValidity()
      }
      return
    }

    if (index === 0) {
      if (this.addressControls.at(0).value.addressProofTypeId == 2) {
        this.images.permanent = [];
        this.imageId.permanent = [];
        Array.prototype.push.apply(this.images.permanent, this.images.identityProof)
        Array.prototype.push.apply(this.imageId.permanent, this.imageId.identityProof)
        this.addressControls.controls[0].patchValue({ addressProof: this.imageId.permanent });
        this.addressControls.controls[0].patchValue({ addressProofImg: this.images.permanent });
        this.addressControls.controls[0].patchValue({ addressProofNumber: this.controls.identityProofNumber.value });
        this.addressControls.controls[0].patchValue({ addressProofFileName: this.controls.identityProofFileName.value });
        this.addressControls.at(0)['controls'].addressProofNumber.disable()
        this.addressFileNameArray1 = this.identityFileNameArray
      } else {
        this.images.permanent = [];
        this.imageId.permanent = [];
        this.addressControls.controls[0].patchValue({ addressProof: this.imageId.permanent });
        this.addressControls.controls[0].patchValue({ addressProofImg: this.images.permanent });
        this.addressControls.controls[0].patchValue({ addressProofNumber: '' });
        this.addressControls.controls[0].patchValue({ addressProofFileName: '' });
        this.addressControls.at(0)['controls'].addressProofNumber.enable()
        this.addressFileNameArray1 = []
      }
    } else {
      if (this.addressControls.at(1).value.addressProofTypeId == 2) {
        this.images.residential = [];
        this.imageId.residential = [];
        Array.prototype.push.apply(this.images.residential, this.images.identityProof)
        Array.prototype.push.apply(this.imageId.residential, this.imageId.identityProof)
        this.addressControls.controls[1].patchValue({ addressProof: this.imageId.residential });
        this.addressControls.controls[1].patchValue({ addressProofImg: this.images.residential });
        this.addressControls.controls[1].patchValue({ addressProofNumber: this.controls.identityProofNumber.value });
        this.addressControls.controls[1].patchValue({ addressProofFileName: this.controls.identityProofFileName.value });
        this.addressControls.at(1)['controls'].addressProofNumber.disable()
        this.addressFileNameArray1 = this.identityFileNameArray
      } else {
        this.images.residential = [];
        this.imageId.residential = [];
        this.addressControls.controls[1].patchValue({ addressProof: this.imageId.residential });
        this.addressControls.controls[1].patchValue({ addressProofImg: this.images.residential });
        this.addressControls.controls[1].patchValue({ addressProofNumber: '' });
        this.addressControls.controls[1].patchValue({ addressProofFileName: '' });
        this.addressControls.at(1)['controls'].addressProofNumber.enable()
        this.addressFileNameArray1 = []
      }
    }

  }

  isPdf(image: string): boolean {
    const ext = this.sharedService.getExtension(image)
    const isPdf = ext == 'pdf' ? true : false
    return isPdf
  }

}
