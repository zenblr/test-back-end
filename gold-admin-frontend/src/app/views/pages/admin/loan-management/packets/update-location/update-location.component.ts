import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PacketLocationService } from '../../../../../../core/masters/packet-location/service/packet-location.service';
import { map } from 'rxjs/operators';
import { UpdateLocationService } from '../../../../../../core/loan-management/update-location/services/update-location.service';

@Component({
  selector: 'kt-update-location',
  templateUrl: './update-location.component.html',
  styleUrls: ['./update-location.component.scss']
})
export class UpdateLocationComponent implements OnInit {

  locationForm: FormGroup
  packetLocations: [any];
  constructor(
    public dialogRef: MatDialogRef<UpdateLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private packetLocationService: PacketLocationService,
    private updateLocationService: UpdateLocationService
  ) { }

  ngOnInit() {
    this.getPacketLocationList()
    this.locationForm = this.fb.group({
      location: ['', [Validators.required]],
      barcodeNumber: this.fb.array([]),
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      user: [, [Validators.required]],
      otp: [, [Validators.required]]
    })

    this.initBarcodeArray()
    this.setForm()
  }

  setForm() {
    const packetArray = this.data.packetData

    let filteredPacketArray = []
    packetArray.forEach(element => {
      const { barcodeNumber: Barcode, packetUniqueId: packetId } = element
      filteredPacketArray.push({ Barcode, packetId })
    });

    this.barcodeNumber.patchValue(filteredPacketArray)
  }

  getPacketLocationList() {
    this.packetLocationService.getpacketsTrackingDetails(1, 100, '').pipe(map(res => {
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
      Barcode: [],
      packetId: []
    })
  }

  initBarcodeArray() {
    for (let index = 0; index < this.data.packetData.length; index++) {
      this.barcodeNumber.push(this.newBarcode())
    }
  }

  scanBarcode(index) {
    const control = this.barcodeNumber.at(index)
    console.log(control)
  }

  getDetailsByMobile() {
    if (this.locationForm.controls.mobileNumber.invalid) return
    const mobileNumber = this.locationForm.controls.mobileNumber.value
    this.updateLocationService.getDetailsByMobile({ mobileNumber }).pipe(map(res => {
      this.locationForm.controls.user.patchValue(`${res.data.firstName} ${res.data.lastName}`)
    })).subscribe()
  }

}
