import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PacketLocationService } from '../../../../core/masters/packet-location/service/packet-location.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { UpdateLocationService } from '../../../../core/loan-management/update-location/services/update-location.service';
import { AuthService } from '../../../../core/auth';
import { BehaviorSubject } from 'rxjs';
import { LeadService } from '../../../../core/lead-management/services/lead.service';

@Component({
  selector: 'kt-update-location',
  templateUrl: './update-location.component.html',
  styleUrls: ['./update-location.component.scss']
})
export class UpdateLocationComponent implements OnInit {

  locationForm: FormGroup
  packetLocations: any[];
  userTypeList = [{ name: 'Customer', value: 'Customer' }, { name: 'Internal User', value: 'InternalUser' }, { name: 'Partner User', value: 'PartnerUser' }]
  filteredPacketArray: any[];
  verifiedPacketsArray = []
  refCode: number; //reference code
  otpSent: boolean = false;
  otpVerfied: boolean;
  partnerBranches: any[];
  deliveryLocations: any[];
  deliveryPartnerBranches: any[];
  userTypeListFiltered = this.userTypeList
  internalBranches: any[];

  constructor(
    public dialogRef: MatDialogRef<UpdateLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private packetLocationService: PacketLocationService,
    private updateLocationService: UpdateLocationService,
    private authService: AuthService,
    private leadService: LeadService
  ) { }

  ngOnInit() {
    console.log(this.data)
    if (!this.data.deliver) this.getPacketLocationList()

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
      partnerId: [],
      partnerName: [],
      partnerBranchId: [],
      internalBranchId: [],
      deliveryPacketLocationId: [],
      deliveryInternalBranchId: [],
      deliveryPartnerBranchId: [],
      id: [],
      releaseId: [],
      role: []
    })

    if (this.data.isPartnerOut) {
      this.controls.partnerBranchId.patchValue(this.data.partnerBranchId)
    }

    if (!this.data.deliver) {
      this.initBarcodeArray()
      this.setForm()
    }

    if (this.data.deliver) {
      this.locationForm.patchValue({
        id: this.data.id,
        receiverType: this.data.receiverType,
        partnerBranchId: this.data.partnerBranchId,
        masterLoanId: this.data.masterLoanId
      })
      this.locationForm.controls.packetLocationId.setValidators([])
      this.locationForm.controls.packetLocationId.updateValueAndValidity()
    }

    if (this.data.isCustomerHomeIn) {
      this.locationForm.patchValue({
        id: this.data.response.id,
        receiverType: this.data.response.receiverType,
        masterLoanId: this.data.masterLoanId,
        mobileNumber: this.data.response.mobileNumber,
        releaseId: this.data.releaseId,
        user: this.data.response.firstName + '' + this.data.response.lastName
      })

      this.controls.receiverType.disable();
      this.controls.mobileNumber.disable();
      this.getDetailsByMobile()
    }
  }

  setForm() {
    const packetArray = this.data.packetData
    this.locationForm.controls.masterLoanId.patchValue(this.data.packetData[0].masterLoanId)
    this.locationForm.controls.loanId.patchValue(this.data.packetData[0].loanId)

    this.filteredPacketArray = []
    packetArray.forEach(element => {
      const { barcodeNumber: Barcode, packetUniqueId: packetId } = element
      this.filteredPacketArray.push({ Barcode, packetId })
    });

    // this.barcodeNumber.patchValue(this.filteredPacketArray)

    for (let index = 0; index < this.filteredPacketArray.length; index++) {
      const e = this.filteredPacketArray[index];
      this.barcodeNumber.at(index).patchValue({ packetId: e.packetId })
    }

    console.log(this.filteredPacketArray)

  }

  getPacketLocationList() {
    let masterLoanId
    if (this.data.isOut || this.data.isPartnerOut) {
      if (this.data.masterLoanId) {
        masterLoanId = this.data.masterLoanId;
      } else {
        masterLoanId = this.data.packetData[0].masterLoanId
      }
      this.updateLocationService.getNextPacketLocation({ masterLoanId }).pipe(map(res => {
        this.packetLocations = res.data;
        if (this.packetLocations.length === 1) {
          this.controls.packetLocationId.patchValue(this.packetLocations[0].id)
          this.getPartnerBranch()
          this.setUserType()
          this.disablePacketLocationId()
        }
      })).subscribe()
    } else {
      this.packetLocationService.getpacketsTrackingDetails(1, -1, '').pipe(map(res => {
        this.packetLocations = res.data;
        if (this.data.stage == 11) {
          this.packetLocations = this.packetLocations.filter(e => e.id === 2 || e.id === 4)
        }
        if (this.data.isCustomerHomeIn) {
          this.packetLocations = this.packetLocations.filter(e => e.id === 7)
          this.controls.packetLocationId.patchValue(this.packetLocations[0].id)
          this.getPartnerBranch()
          this.setUserType()
        }
        this.deliveryLocations = res.data
      })).subscribe()
    }

    if (this.data.isOut) {
      this.packetLocationService.getpacketsTrackingDetails(1, -1, '').pipe(map(res => {
        this.deliveryLocations = res.data.filter(e => e.id === 4)
        this.controls.deliveryPacketLocationId.patchValue(this.deliveryLocations[0].id)
        this.getdeliveryPartnerBranch()
        this.disableDeliveryPacketLocationId()
      })).subscribe()
    }
  }

  action(event) {
    if (event) {
      this.submit()
    } else {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.locationForm.invalid) {
      return this.locationForm.markAllAsTouched()
    }
    console.log(this.locationForm.value)

    if (!this.data.deliver) {

      if (this.verifiedPacketsArray.length != this.data.packetData.length) return

      const isVerified = this.verifiedPacketsArray.every(e => e.isVerified === true)
      //console.log(this.verifiedPacketsArray)
      if (!isVerified) {
        console.log(`Packets are not completely verified!`)
        for (const iterator of this.barcodeNumber.controls) {
          if (iterator.get('Barcode').invalid) {
            iterator.get('Barcode').markAsTouched()
          }
        }
        return this.toastr.error('Packets are not completely verified')
      }
    }

    if (!this.otpVerfied)
      return this.toastr.error('OTP not verified!')

    if (this.data.stage == 11) {
      this.enablePacketLocationId()
      this.enableUserType()
      this.updateLocationService.submitPacketLocation(this.locationForm.value)
        .pipe(
          map(() => {
            const msg = 'Packet Location Submitted Successfully';
            this.toastr.success(msg);
            this.dialogRef.close(true);
          }),
          finalize(() => this.disableUserType()))
        .subscribe();
    }
    else if (this.data.deliver) {
      this.updateLocationService.deliverPartnerBranch(this.locationForm.value).subscribe(res => {
        if (res) {
          this.toastr.success(res.message);
          this.dialogRef.close(true);
        }
      });
    } else if (this.data.isPartnerOut) {
      this.updateLocationService.collectPacket(this.locationForm.value).subscribe(res => {
        if (res) {
          const msg = 'Packet Location Updated Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      })
    } else if (this.data.isCustomerHomeIn) {
      this.controls.receiverType.enable();
      let isPartRelease = false
      let isFullRelease = false
      if (this.data.isPartRelease) {
        isPartRelease = true
      } else {
        isFullRelease = true
      }
      this.updateLocationService.customerHomeOut(this.locationForm.value, isFullRelease, isPartRelease).subscribe(res => {
        if (res) {
          const msg = 'Packet Location Updated Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      }, err => { },
        () => {
          this.controls.receiverType.disable();
        })
    } else {
      this.updateLocationService.addPacketLocation(this.locationForm.value).subscribe(res => {
        if (res) {
          const msg = 'Packet Location Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get barcodeNumber() {
    return this.locationForm.controls.barcodeNumber as FormArray
  }

  addBarcode() {
    this.barcodeNumber.push(this.newBarcode())
  }

  newBarcode(): FormGroup {
    return this.fb.group({
      Barcode: ['', [Validators.required]],
      packetId: ['', [Validators.required]]
    })
  }

  initBarcodeArray() {
    if (this.data.packetData && this.data.packetData.length) {
      for (let index = 0; index < this.data.packetData.length; index++) {
        this.barcodeNumber.push(this.newBarcode())
        const packetObject = { isVerified: false }
        this.verifiedPacketsArray.push(packetObject)
      }
    }
  }

  scanBarcode(index) {
    const formGroup = this.barcodeNumber.at(index)
    const filteredFormGroup = this.filteredPacketArray[index]
    const isVerified = (JSON.stringify(formGroup.value)).toLowerCase() === (JSON.stringify(filteredFormGroup)).toLowerCase()

    console.log(isVerified)
    if (!isVerified) {
      formGroup.get('Barcode').setErrors({ unverified: true })
      this.verifiedPacketsArray.splice(index, 1, { isVerified })
    } else {
      this.verifiedPacketsArray.splice(index, 1, { isVerified })
    }
  }

  getDetailsByMobile() {
    if (this.locationForm.controls.mobileNumber.invalid || this.locationForm.controls.receiverType.invalid) {
      if (this.locationForm.controls.otp.value) {
        this.locationForm.controls.otp.reset()
        this.otpVerfied = false
        this.otpSent = false
      }
      return
    }
    const mobileNumber = this.locationForm.controls.mobileNumber.value
    const receiverType = this.locationForm.controls.receiverType.value
    const partnerBranchId = this.locationForm.controls.partnerBranchId.value
    const masterLoanId = this.locationForm.controls.masterLoanId.value
    const allUsers = this.locationForm.controls.packetLocationId.value == 2 ? 0 : 1
    const internalBranchId = this.locationForm.controls.internalBranchId.value

    if (this.controls.receiverType.value === 'PartnerUser') {
      if (this.controls.partnerBranchId.invalid) return this.controls.partnerBranchId.markAsTouched()
    }

    this.updateLocationService.getDetailsByMobile({ mobileNumber, receiverType, partnerBranchId, masterLoanId, allUsers, internalBranchId }).subscribe(res => {
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
      this.locationForm.controls.user.patchValue(`${res.data.firstName} ${res.data.lastName}`)
      if (res.data.roles) {
        this.controls.role.patchValue(res.data.roles[0].roleName)
      }
    }, err => {
      this.remove()
    }
    );
  }

  sendOTP() {
    this.otpSent = true
    this.generateOTP()
  }

  generateOTP() {
    if (this.locationForm.controls.mobileNumber.invalid) return this.controls.mobileNumber.markAsTouched()

    const mobileNumber = this.locationForm.controls.mobileNumber.value
    switch (this.locationForm.controls.receiverType.value) {
      case 'Customer':
        this.updateLocationService.sendCustomerOtp(mobileNumber).subscribe(res => {
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
            this.toastr.error(err.error.message)
          })

        break;

      case 'PartnerUser':
        this.updateLocationService.sendPartnerOtp(mobileNumber).subscribe(res => {
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
            this.toastr.error(err.error.message)
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
        }
          ,
          err => {
            this.toastr.error(err.error.message)
          });
        break;

      case 'PartnerUser':
        this.updateLocationService.verifyPartnerOtp(params).subscribe(res => {
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
    this.otpVerfied = false
  }

  verifyBarcode(index) {
    const formGroup = this.barcodeNumber.at(index)
    const filteredFormGroup = this.filteredPacketArray[index]
    const isVerified = (JSON.stringify(formGroup.value)).toLowerCase() === (JSON.stringify(filteredFormGroup)).toLowerCase()

    console.log(isVerified)
    if (!isVerified) {
      formGroup.get('Barcode').setErrors({ unverified: true })
      this.verifiedPacketsArray.splice(index, 1, { isVerified })
      // console.log(formGroup)
    } else {
      this.verifiedPacketsArray.splice(index, 1, { isVerified })
      // formGroup.get('Barcode').disable()
    }
  }

  get controls() {
    return this.locationForm.controls
  }

  getPartnerBranch() {
    if (this.data.stage != 11) return

    // if (this.controls.packetLocationId.value != 4) this.clearPartnerData()

    const params = {
      packetLocationId: this.locationForm.controls.packetLocationId.value,
      masterLoanId: this.locationForm.controls.masterLoanId.value,
    }

    this.updateLocationService.getLocation(params).pipe(map(res => {
      if (this.controls.packetLocationId.value == 2) {
        this.internalBranches = res.data
        this.controls.internalBranchId.patchValue(res.loanBranchId)
        this.controls.partnerBranchId.setValidators([])
        this.controls.partnerBranchId.updateValueAndValidity()
        this.clearPartnerData()
      }
      if (this.controls.packetLocationId.value == 4) {
        this.controls.partnerId.patchValue(res.data.id)
        this.controls.partnerName.patchValue(res.data.name)
        this.partnerBranches = res.data.partnerBranch
        this.controls.partnerBranchId.setValidators([Validators.required])
        this.controls.partnerBranchId.updateValueAndValidity()
        this.clearInternalBranchData()
      }
      // console.log(res)
    })).subscribe()
  }

  getdeliveryPartnerBranch() {
    const params = {
      packetLocationId: this.locationForm.controls.deliveryPacketLocationId.value,
      masterLoanId: this.locationForm.controls.masterLoanId.value,
    }

    this.updateLocationService.getLocation(params).pipe(map(res => {
      if (this.controls.deliveryPacketLocationId.value == 2) {
        this.controls.deliveryInternalBranchId.patchValue(res.data[0].id)
        this.clearPartnerData()
      }
      if (this.controls.deliveryPacketLocationId.value == 4) {
        // this.controls.deliveryPartnerBranchId.patchValue(res.data.id)
        // this.controls.partnerName.patchValue(res.data.name)
        this.deliveryPartnerBranches = res.data.partnerBranch
        this.clearInternalBranchData()
      }
      // console.log(res)
    })).subscribe()
  }

  clearPartnerData() {
    this.controls.partnerId.reset()
    this.controls.partnerName.reset()
  }

  clearInternalBranchData() {
    this.controls.internalBranchId.reset()
  }

  clearDeliveryPartnerData() {
    this.controls.deliveryPartnerBranchId.reset()
  }

  clearDeliveryInternalBranchData() {
    this.controls.deliveryInternalBranchId.reset()
  }

  setUserType() {
    if (!this.data.isCustomerHomeIn) {
      const packetLocationId = this.controls.packetLocationId.value
      this.controls.receiverType.patchValue('')

      switch (Number(packetLocationId)) {
        case 2:
          this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'InternalUser')
          this.patchUserTye('InternalUser')
          this.disableUserType()
          break;

        case 4:
          if (this.data.isOut) {
            this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'InternalUser')
            this.patchUserTye('InternalUser')
            this.disableUserType()
          } else {
            this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'PartnerUser')
            this.patchUserTye('PartnerUser')
            this.disableUserType()
          }
          break

        case 3:
          this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'InternalUser')
          this.patchUserTye('InternalUser')
          this.disableUserType()
          break;

        case 5:
          this.userTypeListFiltered = this.userTypeList.filter(e => e.value === 'PartnerUser')
          this.patchUserTye('PartnerUser')
          this.disableUserType()
          break;

        default:
          this.userTypeListFiltered = this.userTypeList
          break;
      }
    }
  }

  patchUserTye(userType) {
    this.controls.receiverType.patchValue(userType)
  }

  disablePacketLocationId() {
    this.controls.packetLocationId.disable()
  }

  enablePacketLocationId() {
    this.controls.packetLocationId.enable()
  }

  disableDeliveryPacketLocationId() {
    this.controls.deliveryPacketLocationId.disable()
  }

  enableDeliveryPacketLocationId() {
    this.controls.deliveryPacketLocationId.enable()
  }

  disableUserType() {
    this.controls.receiverType.disable()
  }

  enableUserType() {
    this.controls.receiverType.enable()
  }
}
