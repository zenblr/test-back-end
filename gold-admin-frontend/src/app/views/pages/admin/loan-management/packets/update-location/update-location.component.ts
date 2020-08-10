import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PacketLocationService } from '../../../../../../core/masters/packet-location/service/packet-location.service';
import { map } from 'rxjs/operators';

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
    private packetLocationService: PacketLocationService
  ) { }

  ngOnInit() {
    this.getPacketLocationList()
    this.locationForm = this.fb.group({
      location: ['', [Validators.required]],
      barcodeNumber: this.fb.array([]),
      mobileNumber: [, [Validators.required]],
      user: [, [Validators.required]],
      otp: [, [Validators.required]]
    })

    this.initBarcodeArray()
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
      barcode: []
    })
  }

  initBarcodeArray() {
    for (let index = 0; index < 1; index++) {
      this.barcodeNumber.push(this.newBarcode())
    }
  }
}
