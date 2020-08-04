import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ScrapPacketsService } from '../../../../../../core/scrap-management';
import { SharedService } from '../../../../../../core/shared/services/shared.service';

@Component({
  selector: 'kt-add-packets',
  templateUrl: './add-packets.component.html',
  styleUrls: ['./add-packets.component.scss']
})
export class AddPacketsComponent implements OnInit {
  packetForm: FormGroup;
  title: string;
  branches = [];
  details: any;

  constructor(
    public dialogRef: MatDialogRef<AddPacketsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private scrapPacketsService: ScrapPacketsService,
    private sharedService: SharedService
  ) {
    this.details = this.sharedService.getDataFromStorage()
  }

  ngOnInit() {
    this.getInternalBranhces();
    this.initForm();
    this.setForm();
  }

  setForm() {
    if (this.data.action == 'add') {
      this.title = 'Add Packet';
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Packet';
      this.packetForm.patchValue(this.data.packetData);
    }
  }

  initForm() {
    this.packetForm = this.fb.group({
      id: [],
      packetUniqueId: ['', [Validators.required]],
      internalUserBranchId: ['', [Validators.required]],
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
      this.packetForm.markAllAsTouched();
      return;
    }
    const packetUniqueId = this.packetForm.get('packetUniqueId').value;
    this.packetForm.controls.packetUniqueId.patchValue(packetUniqueId.toLowerCase());
    const partnerData = this.packetForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.scrapPacketsService.updatePacket(id, partnerData).subscribe(res => {
        if (res) {
          const msg = 'Packet Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    } else {
      this.scrapPacketsService.addPacket(partnerData).subscribe(res => {
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

  getInternalBranhces() {
    this.scrapPacketsService.getInternalBranhces().subscribe(res => {
      this.branches = res.data;
    });
  }
}
