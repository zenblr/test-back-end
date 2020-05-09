import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PacketsService } from '../../../../../core/loan-management';

@Component({
  selector: 'kt-assign-packets',
  templateUrl: './assign-packets.component.html',
  styleUrls: ['./assign-packets.component.scss']
})
export class AssignPacketsComponent implements OnInit {
  packetForm: FormGroup;
  title: string;
  constructor(
    public dialogRef: MatDialogRef<AssignPacketsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private packetsService: PacketsService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }

  setForm() {
    if (this.data.action == 'add') {
      this.title = 'Add New Packet'
      // this.isMandatory = true

    } else if (this.data.action == 'edit') {
      this.title = 'Edit Packet'
      // this.isMandatory = true
      // this.getPartnerById(this.data.partnerId);
      this.packetForm.patchValue(this.data.packetData);
    }
  }

  initForm() {
    this.packetForm = this.fb.group({
      id: [],
      packetId: ['', [Validators.required]]
    })
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.packetForm.invalid) {
      this.packetForm.markAllAsTouched()
      return
    }
    // console.log(this.packetForm.value);
    const partnerData = this.packetForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.packetsService.updatePacket(id, partnerData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Packet Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.packetsService.addPacket(partnerData).subscribe(res => {
        // console.log(res);
        if (res) {
          const msg = 'Packet Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.packetForm.controls;
  }
}
