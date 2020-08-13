import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PacketLocationService } from '../../../../../../core/masters/packet-location/service/packet-location.service';
import { map, catchError } from 'rxjs/operators';
import { UpdateLocationService } from '../../../../../../core/loan-management/update-location/services/update-location.service';
import { AuthService } from '../../../../../../core/auth';

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

  constructor(
    public dialogRef: MatDialogRef<UpdateLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private packetLocationService: PacketLocationService,
    private updateLocationService: UpdateLocationService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getPacketLocationList()
    this.locationForm = this.fb.group({
      location: ['', [Validators.required]],
      barcodeNumber: this.fb.array([]),
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      user: [, [Validators.required]],
      userType: ['', [Validators.required]],
      otp: [, [Validators.required]]
    })

    this.initBarcodeArray()
    this.setForm()
  }

  setForm() {
    const packetArray = this.data.packetData

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
    }
  }

  scanBarcode(index) {
    const formGroup = this.barcodeNumber.at(index)
    const filteredFormGroup = this.filteredPacketArray[index]
    const isVerified = (JSON.stringify(formGroup.value)).toLowerCase() === (JSON.stringify(filteredFormGroup)).toLowerCase()

    console.log(isVerified)
    if (!isVerified) formGroup.get('Barcode').setErrors({ unverified: true })

  }

  getDetailsByMobile() {
    if (this.locationForm.controls.mobileNumber.invalid || this.locationForm.controls.userType.invalid) return
    const mobileNumber = this.locationForm.controls.mobileNumber.value
    const isSelected = this.locationForm.controls.userType.value
    this.updateLocationService.getDetailsByMobile({ mobileNumber, isSelected }).pipe(map(res => {
      this.locationForm.controls.user.patchValue(`${res.data.firstName} ${res.data.lastName}`)
    })).subscribe()
  }

  generateOTP() {
    const mobileNumber = this.locationForm.controls.mobileNumber.value
    this.authService.generateOtp(mobileNumber, 'lead').pipe(
      map(res => {
        console.log(res)
      }),
      catchError(err => {
        if (err.error.message) this.toastr.error(err.error.message)
        throw (err)
      })
    ).subscribe()
  }

}
