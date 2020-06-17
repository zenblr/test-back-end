import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PacketLocationService } from '../../../../../../core/masters/packet-location/service/packet-location.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-add-packet-location',
  templateUrl: './add-packet-location.component.html',
  styleUrls: ['./add-packet-location.component.scss']
})
export class AddPacketLocationComponent implements OnInit {

  packetLocation: FormGroup
  title: string;
  button: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddPacketLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private packetLocationService: PacketLocationService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    console.log(this.data)
    this.initForm()
    this.setTitle()
  }

  initForm() {
    this.packetLocation = this.fb.group({
      id: [],
      location: ['', Validators.required]
    })
  }

  setTitle() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = "Add Location";
      this.button = "Add";
    } else {
      this.button = "Update";
      this.title = "Edit Location"
      this.packetLocation.patchValue(this.data.locationData)
    }
  }

  get controls() {
    return this.packetLocation.controls
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.packetLocation.invalid) {
      this.packetLocation.markAllAsTouched()
      return
    }

    const data = this.packetLocation.value;
    const id = this.controls.id.value;


    if (this.data.action == 'edit') {
      this.packetLocationService.updatepacketLocation(id, data.location).subscribe(res => {
        if (res) {
          const msg = 'Ornament Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.packetLocationService.addpacketLocation(data.location).subscribe(res => {
        if (res) {
          const msg = 'Ornament Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }

  }


}
