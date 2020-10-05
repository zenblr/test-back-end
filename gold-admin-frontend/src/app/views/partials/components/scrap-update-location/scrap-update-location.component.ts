import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { map, catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth';
import { LeadService } from '../../../../core/lead-management/services/lead.service';
import { ScrapPacketLocationService } from '../../../../core/masters/scrap-packet-location/service/scrap-packet-location.service';
import { ScrapUpdateLocationService } from '../../../../core/scrap-management/scrap-update-location/services/scrap-update-location.service';

@Component({
  selector: 'kt-scrap-update-location',
  templateUrl: './scrap-update-location.component.html',
  styleUrls: ['./scrap-update-location.component.scss']
})
export class ScrapUpdateLocationComponent implements OnInit {
  locationForm: FormGroup
  packetLocations: any[];
  userTypeList = [{ name: 'Customer', value: 'Customer' }, { name: 'Internal User', value: 'InternalUser' }, { name: 'Partner User', value: 'PartnerUser' }]
  filteredPacketArray: any[];
  verifiedPacketsArray = []
  refCode: number; //reference code
  otpSent: boolean = false;
  otpVerfied: boolean;
  partnerBranches: any[];
  deliveryPartnerBranches: any[];
  userTypeListFiltered = this.userTypeList
  internalBranches: any[];

  constructor(
    public dialogRef: MatDialogRef<ScrapUpdateLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private scrapPacketLocationService: ScrapPacketLocationService,
    private scrapUpdateLocationService: ScrapUpdateLocationService,
    private authService: AuthService,
    private leadService: LeadService
  ) { }

  ngOnInit() {
    this.locationForm = this.fb.group({
      packetLocationId: [, [Validators.required]],
      barcodeNumber: this.fb.array([]),
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      user: [, [Validators.required]],
      receiverType: ['', [Validators.required]],
      otp: [, [Validators.required]],
      referenceCode: [this.refCode],
      userReceiverId: [null],
      customerReceiverId: [null],
      partnerReceiverId: [null],
      loanId: [null],
      masterLoanId: [null],
      scrapId: [null],
      partnerId: [],
      partnerName: [],
      partnerBranchId: [],
      internalBranchId: [],
      deliveryPacketLocationId: [],
      deliveryInternalBranchId: [],
      deliveryPartnerBranchId: [],
      id: [],
      releaseId: [],
      role: [],
      courier: [null],
      podNumber: [null],
    });

    this.locationForm.valueChanges.subscribe(val => console.log(val))

    // if (!this.data.deliver) {
    this.getPacketLocationList();
    this.initBarcodeArray();
    this.setForm();
    // }

    if (this.data.isOut) {
      this.locationForm.controls.mobileNumber.setValidators([])
      this.locationForm.controls.mobileNumber.updateValueAndValidity(),
        this.locationForm.controls.user.setValidators([])
      this.locationForm.controls.user.updateValueAndValidity(),
        this.locationForm.controls.otp.setValidators([])
      this.locationForm.controls.otp.updateValueAndValidity(),
        this.locationForm.controls.courier.setValidators([Validators.required])
      this.locationForm.controls.courier.updateValueAndValidity(),
        this.locationForm.controls.podNumber.setValidators([Validators.required])
      this.locationForm.controls.podNumber.updateValueAndValidity()
    }
  }

  setForm() {
    const packetArray = this.data.packetData;
    this.locationForm.controls.scrapId.patchValue(this.data.packetData[0].scrapId);
    this.filteredPacketArray = [];
    packetArray.forEach(element => {
      const { barcodeNumber: Barcode, packetUniqueId: packetId } = element;
      this.filteredPacketArray.push({ Barcode, packetId });
    });
    for (let index = 0; index < this.filteredPacketArray.length; index++) {
      const e = this.filteredPacketArray[index];
      this.barcodeNumber.at(index).patchValue({ packetId: e.packetId });
    }
    console.log(this.filteredPacketArray);
  }

  getPacketLocationList() {
    let scrapId;
    if (this.data.isOut) {
      if (this.data.scrapId) {
        scrapId = this.data.scrapId;
      } else {
        scrapId = this.data.packetData[0].scrapId
      }
      this.scrapUpdateLocationService.getNextPacketLocation({ scrapId }).pipe(map(res => {
        this.packetLocations = res.data;
        if (this.packetLocations.length === 1) {
          this.controls.packetLocationId.patchValue(this.packetLocations[0].id)
          this.getPartnerBranch();
          this.setUserType();
          this.disablePacketLocationId();
        }
      })).subscribe();
    } else {
      this.scrapPacketLocationService.getScrapPacketsTrackingDetails(1, -1, '').pipe(map(res => {
        this.packetLocations = res.data;
        if (this.data.stage == 11) {
          this.packetLocations = this.packetLocations.filter(e => e.id === 2)
          this.controls.packetLocationId.patchValue(this.packetLocations[0].id);
          this.getPartnerBranch();
          this.setUserType();
          this.disablePacketLocationId();
        }
      })).subscribe();
    }
  }

  action(event) {
    if (event) {
      this.submit();
    } else {
      this.dialogRef.close();
    }
  }

  submit() {
    if (this.locationForm.invalid) {
      return this.locationForm.markAllAsTouched();
    }
    console.log(this.locationForm.value);

    if (!this.data.deliver) {
      if (this.verifiedPacketsArray.length != this.data.packetData.length) {
        return;
      }
      const isVerified = this.verifiedPacketsArray.every(e => e.isVerified === true);
      if (!isVerified) {
        console.log(`Packets are not completely verified!`);
        for (const iterator of this.barcodeNumber.controls) {
          if (iterator.get('Barcode').invalid) {
            iterator.get('Barcode').markAsTouched();
          }
        }
        return this.toastr.error('Packets are not completely verified');
      }
    }

    if (this.data.stage == 11) {
      if (!this.otpVerfied) {
        return this.toastr.error('OTP not verified!')
      }
      this.enablePacketLocationId();
      this.enableUserType();
      this.scrapUpdateLocationService.submitScrapPacketLocation(this.locationForm.value)
        .pipe(
          map(() => {
            const msg = 'Packet Location Submitted Successfully';
            this.toastr.success(msg);
            this.dialogRef.close(true);
          }),
          finalize(() => {
            this.disablePacketLocationId();
            this.disableUserType();
          }))
        .subscribe();
    }
    else {
      this.enablePacketLocationId();
      this.enableUserType();
      this.enableDeliveryPacketLocationId();
      this.scrapUpdateLocationService.addPacketLocation(this.locationForm.value)
        .pipe(
          map(res => {
            const msg = 'Packet Location Added Successfully';
            this.toastr.success(msg);
            this.dialogRef.close(true);
          }),
          finalize(() => {
            this.disablePacketLocationId();
            this.disableDeliveryPacketLocationId();
          })).subscribe();
    }
  }

  get barcodeNumber() {
    return this.locationForm.controls.barcodeNumber as FormArray;
  }

  addBarcode() {
    this.barcodeNumber.push(this.newBarcode());
  }

  newBarcode(): FormGroup {
    return this.fb.group({
      Barcode: ['', [Validators.required]],
      packetId: ['', [Validators.required]]
    });
  }

  initBarcodeArray() {
    if (this.data.packetData && this.data.packetData.length) {
      for (let index = 0; index < this.data.packetData.length; index++) {
        this.barcodeNumber.push(this.newBarcode());
        const packetObject = { isVerified: false };
        this.verifiedPacketsArray.push(packetObject);
      }
    }
  }

  scanBarcode(index) {
    const formGroup = this.barcodeNumber.at(index);
    const filteredFormGroup = this.filteredPacketArray[index];
    const isVerified = (JSON.stringify(formGroup.value)).toLowerCase() === (JSON.stringify(filteredFormGroup)).toLowerCase();
    console.log(isVerified)
    if (!isVerified) {
      formGroup.get('Barcode').setErrors({ unverified: true });
      this.verifiedPacketsArray.splice(index, 1, { isVerified });
    } else {
      this.verifiedPacketsArray.splice(index, 1, { isVerified });
    }
  }

  getDetailsByMobile() {
    if (this.locationForm.controls.mobileNumber.invalid || this.locationForm.controls.receiverType.invalid) {
      if (this.locationForm.controls.otp.value) {
        this.locationForm.controls.otp.reset();
        this.otpVerfied = false;
        this.otpSent = false;
      }
      return;
    }
    const mobileNumber = this.locationForm.controls.mobileNumber.value;
    const receiverType = this.locationForm.controls.receiverType.value;
    const scrapId = this.locationForm.controls.scrapId.value;

    if (this.controls.receiverType.value === 'PartnerUser') {
      if (this.controls.partnerBranchId.invalid) {
        return this.controls.partnerBranchId.markAsTouched();
      }
    }

    this.scrapUpdateLocationService.getDetailsByMobile({ mobileNumber, receiverType, scrapId }).subscribe(res => {
      switch (res.receiverType) {
        case 'Customer':
          this.locationForm.controls.customerReceiverId.patchValue(res.data.id)
          break;
        case 'InternalUser':
          this.locationForm.controls.userReceiverId.patchValue(res.data.id)
          break;
        case 'PartnerUser':
          this.locationForm.controls.partnerReceiverId.patchValue(res.data.id)
          break;
      }
      // if (res) {
      //   this.otpSent = true;
      // }
      this.locationForm.controls.user.patchValue(`${res.data.firstName} ${res.data.lastName}`);
      if (res.data.roles) {
        this.controls.role.patchValue(res.data.roles[0].roleName);
      }
    }, err => {
      this.remove();
    }
    );
  }

  sendOTP() {
    this.otpSent = true;
    this.generateOTP();
  }

  generateOTP() {
    if (this.locationForm.controls.mobileNumber.invalid) {
      return this.controls.mobileNumber.markAsTouched();
    }

    const mobileNumber = this.locationForm.controls.mobileNumber.value;
    switch (this.locationForm.controls.receiverType.value) {
      case 'Customer':
        this.scrapUpdateLocationService.sendCustomerOtp(mobileNumber).subscribe(res => {
          if (res) {
            this.refCode = res.referenceCode;
            this.locationForm.controls.referenceCode.patchValue(res.referenceCode);
            const msg = 'Otp has been sent to the registered mobile number';
            this.toastr.success(msg);
          }
        })
        break;
      case 'InternalUser':
        this.authService.generateOtp(mobileNumber, 'lead').subscribe(res => {
          if (res) {
            this.refCode = res.referenceCode;
            this.locationForm.controls.referenceCode.patchValue(res.referenceCode);
            const msg = 'Otp has been sent to the registered mobile number';
            this.toastr.success(msg);
          }
        },
          err => {
            this.toastr.error(err.error.message);
          })
        break;
      case 'PartnerUser':
        this.scrapUpdateLocationService.sendPartnerOtp(mobileNumber).subscribe(res => {
          if (res) {
            this.refCode = res.referenceCode;
            this.locationForm.controls.referenceCode.patchValue(res.referenceCode);
            const msg = 'Otp has been sent to the registered mobile number';
            this.toastr.success(msg);
          }
        })
        break;
    }
  }

  verifyOTP() {
    const params = {
      otp: this.locationForm.controls.otp.value,
      referenceCode: this.locationForm.controls.referenceCode.value,
      type: 'lead'
    };
    switch (this.locationForm.controls.receiverType.value) {
      case 'Customer':
        this.leadService.verifyOtp(params).subscribe(res => {
          if (res) {
            this.otpSent = true;
            this.otpVerfied = true;
            const msg = 'Otp has been verified!'
            this.toastr.success(msg);
          }
        },
          err => {
            this.toastr.error(err.error.message);
          }
        );
        break;
      case 'InternalUser':
        this.authService.verifyotp(params.referenceCode, params.otp, params.type).subscribe(res => {
          if (res) {
            this.otpSent = true;
            this.otpVerfied = true;
            const msg = 'Otp has been verified!'
            this.toastr.success(msg);
          }
        },
          err => {
            this.toastr.error(err.error.message);
          });
        break;
      case 'PartnerUser':
        this.scrapUpdateLocationService.verifyPartnerOtp(params).subscribe(res => {
          if (res) {
            this.otpSent = true;
            this.otpVerfied = true;
            const msg = 'Otp has been verified!'
            this.toastr.success(msg);
          }
        });
        break;
    }
  }

  remove() {
    this.locationForm.controls.otp.patchValue(null);
    this.locationForm.controls.referenceCode.patchValue(null);
    this.locationForm.controls.mobileNumber.patchValue(null);
    this.locationForm.controls.user.patchValue(null);
    this.locationForm.controls.role.patchValue(null);
    this.otpVerfied = false;
  }

  verifyBarcode(index) {
    const formGroup = this.barcodeNumber.at(index);
    const filteredFormGroup = this.filteredPacketArray[index];
    const isVerified = (JSON.stringify(formGroup.value)).toLowerCase() === (JSON.stringify(filteredFormGroup)).toLowerCase();
    console.log(isVerified);
    if (!isVerified) {
      formGroup.get('Barcode').setErrors({ unverified: true });
      this.verifiedPacketsArray.splice(index, 1, { isVerified });
      // console.log(formGroup)
    } else {
      this.verifiedPacketsArray.splice(index, 1, { isVerified });
      // formGroup.get('Barcode').disable()
    }
  }

  get controls() {
    return this.locationForm.controls;
  }

  getPartnerBranch() {
    if (this.data.stage != 11) {
      return;
    }
    // if (this.controls.packetLocationId.value != 4) this.clearPartnerData()
    const params = {
      packetLocationId: this.locationForm.controls.packetLocationId.value,
      scrapId: this.locationForm.controls.scrapId.value,
    }
    this.scrapUpdateLocationService.getLocation(params).pipe(map(res => {
      if (this.controls.packetLocationId.value == 2) {
        this.internalBranches = res.data;
        this.controls.internalBranchId.patchValue(res.scrapBranchId);
        this.controls.partnerBranchId.setValidators([]);
        this.controls.partnerBranchId.updateValueAndValidity();
        this.clearPartnerData();
      }
      if (this.controls.packetLocationId.value == 4) {
        this.controls.partnerId.patchValue(res.data.id);
        this.controls.partnerName.patchValue(res.data.name);
        this.partnerBranches = res.data.partnerBranch;
        this.controls.partnerBranchId.setValidators([Validators.required]);
        this.controls.partnerBranchId.updateValueAndValidity();
        this.clearInternalBranchData();
      }
      // console.log(res)
    })).subscribe();
  }

  getdeliveryPartnerBranch() {
    const params = {
      packetLocationId: this.locationForm.controls.deliveryPacketLocationId.value,
      masterLoanId: this.locationForm.controls.masterLoanId.value,
    }
    this.scrapUpdateLocationService.getLocation(params).pipe(map(res => {
      if (this.controls.deliveryPacketLocationId.value == 2) {
        this.controls.deliveryInternalBranchId.patchValue(res.data[0].id);
        this.clearPartnerData();
      }
      if (this.controls.deliveryPacketLocationId.value == 4) {
        // this.controls.deliveryPartnerBranchId.patchValue(res.data.id)
        // this.controls.partnerName.patchValue(res.data.name)
        this.deliveryPartnerBranches = res.data.partnerBranch;
        this.clearInternalBranchData();
      }
      // console.log(res)
    })).subscribe();
  }

  clearPartnerData() {
    this.controls.partnerId.reset();
    this.controls.partnerName.reset();
  }

  clearInternalBranchData() {
    this.controls.internalBranchId.reset();
  }

  clearDeliveryPartnerData() {
    this.controls.deliveryPartnerBranchId.reset();
  }

  clearDeliveryInternalBranchData() {
    this.controls.deliveryInternalBranchId.reset();
  }

  setUserType() {
    if (!this.data.isCustomerHomeIn) {
      const packetLocationId = this.controls.packetLocationId.value;
      this.controls.receiverType.patchValue('');
      switch (Number(packetLocationId)) {
        case 2:
          this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'InternalUser');
          this.patchUserTye('InternalUser');
          this.disableUserType();
          break;
        case 4:
          if (this.data.isOut) {
            this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'InternalUser');
            this.patchUserTye('InternalUser');
            this.disableUserType();
          } else {
            this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'PartnerUser');
            this.patchUserTye('PartnerUser');
            this.disableUserType();
          }
          break;
        case 3:
          this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'InternalUser');
          this.patchUserTye('InternalUser');
          this.disableUserType();
          break;
        case 5:
          this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'PartnerUser');
          this.patchUserTye('PartnerUser');
          this.disableUserType();
          break;
        default:
          this.userTypeListFiltered = this.userTypeList;
          break;
      }
    }
  }

  patchUserTye(userType) {
    this.controls.receiverType.patchValue(userType);
  }

  disablePacketLocationId() {
    this.controls.packetLocationId.disable();
  }

  enablePacketLocationId() {
    this.controls.packetLocationId.enable();
  }

  disableDeliveryPacketLocationId() {
    this.controls.deliveryPacketLocationId.disable();
  }

  enableDeliveryPacketLocationId() {
    this.controls.deliveryPacketLocationId.enable();
  }

  disableUserType() {
    this.controls.receiverType.disable();
  }

  enableUserType() {
    this.controls.receiverType.enable();
  }
}
