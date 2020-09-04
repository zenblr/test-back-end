import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PacketLocationService } from '../../../../../../core/masters/packet-location/service/packet-location.service';
import { map, catchError } from 'rxjs/operators';
import { UpdateLocationService } from '../../../../../../core/loan-management/update-location/services/update-location.service';
import { AuthService } from '../../../../../../core/auth';
import { BehaviorSubject } from 'rxjs';
import { LeadService } from '../../../../../../core/lead-management/services/lead.service';

@Component({
  selector: 'kt-update-location',
  templateUrl: './update-location.component.html',
  styleUrls: ['./update-location.component.scss']
})
export class UpdateLocationComponent implements OnInit {

  locationForm: FormGroup
  packetLocations: [any];
  userTypeList = [{ name: 'Customer', value: 'Customer' }, { name: 'Internal User', value: 'InternalUser' }, { name: 'Partner User', value: 'PartnerUser' }]
  filteredPacketArray: any[];
  verifiedPacketsArray = []
  refCode: number; //reference code
  otpSent: boolean = false;
  otpVerfied: boolean;

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
    this.getPacketLocationList()
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

    })

    this.initBarcodeArray()
    this.setForm()
  }

  setForm() {
    const packetArray = this.data.packetData
    //console.log(this.data.packetData)
    this.locationForm.controls.masterLoanId.patchValue(this.data.packetData[0].masterLoanId)
    console.log(this.data.packetData[0].masterLoanId, 'masterLoanId')
    console.log(this.data.packetData[0].loanId, 'loanId')
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
    this.packetLocationService.getpacketsTrackingDetails(1, -1, '').pipe(map(res => {
      this.packetLocations = res.data

    })).subscribe()
  }

  action(event) {
    if (event) {
      this.submit()
    } else {
      this.dialogRef.close()
    }
  }

  submit() {
    if (this.locationForm.invalid) return this.locationForm.markAllAsTouched()

    console.log(this.locationForm.value)


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
    this.updateLocationService.addPacketLocation(this.locationForm.value).subscribe(res => {
      // console.log(res);
      if (res) {
        const msg = 'Packet Location Added Successfully';
        this.toastr.success(msg);
        this.dialogRef.close(true);
      }
    });
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
    for (let index = 0; index < this.data.packetData.length; index++) {
      this.barcodeNumber.push(this.newBarcode())
      const packetObject = { isVerified: false }
      this.verifiedPacketsArray.push(packetObject)
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
      }
      return
    }
    const mobileNumber = this.locationForm.controls.mobileNumber.value
    const receiverType = this.locationForm.controls.receiverType.value

    this.updateLocationService.getDetailsByMobile({ mobileNumber, receiverType }).subscribe(res => {
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
      if (res) {
        this.otpSent = true;
      }
      this.locationForm.controls.user.patchValue(`${res.data.firstName} ${res.data.lastName}`)
    }, err => {
      this.remove()
    }
    );
  }

  generateOTP() {
    const mobileNumber = this.locationForm.controls.mobileNumber.value
    switch (this.locationForm.controls.receiverType.value) {
      case 'Customer':
        this.updateLocationService.sendCustomerOtp(mobileNumber).subscribe(res => {
          console.log(res)
          if (res) {
            this.refCode = res.referenceCode;
            this.locationForm.controls.referenceCode.patchValue(this.refCode);
            const msg = 'Otp has been sent to the registered mobile number';
            this.toastr.success(msg);
          }
        },
          err => {
            this.toastr.error(err.error.message)
          })

        break;
      case 'InternalUser':
        this.authService.generateOtp(mobileNumber, 'lead').subscribe(res => {
          console.log(res)
          if (res) {
            this.refCode = res.referenceCode;
            this.locationForm.controls.referenceCode.patchValue(this.refCode);
            const msg = 'Otp has been sent to the registered mobile number';
            this.toastr.success(msg);
          }
        },
          err => {
            this.toastr.error(err.error.message)
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
    }
  }

  remove() {
    this.locationForm.controls.otp.patchValue(null);
    this.locationForm.controls.referenceCode.patchValue(null);
    this.locationForm.controls.mobileNumber.patchValue(null);
    this.locationForm.controls.user.patchValue(null);
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
}
