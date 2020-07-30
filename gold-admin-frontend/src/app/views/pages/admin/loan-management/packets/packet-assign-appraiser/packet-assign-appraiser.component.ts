import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { PacketsService } from '../../../../../../core/loan-management';
import { AppraiserService } from '../../../../../../core/user-management/appraiser';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-packet-assign-appraiser',
  templateUrl: './packet-assign-appraiser.component.html',
  styleUrls: ['./packet-assign-appraiser.component.scss']
})
export class PacketAssignAppraiserComponent implements OnInit {
  packetForm: FormGroup;
  appraisers: any;

  constructor(
    public dialogRef: MatDialogRef<PacketAssignAppraiserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private packetsService: PacketsService,
    private appraiserService: AppraiserService
  ) { }

  ngOnInit() {
    this.getAllAppraiser()
    this.initForm();
    this.setForm();
  }

  setForm() {
    console.log(this.data.packetData)
    // let packetIdArr = []
    // this.data.packetData.forEach(element => {
    //   packetIdArr.push(element.id)
    // });
    if (this.data.action == 'add') {
      this.packetForm.controls.multiselect.patchValue({ multiSelect: this.data.packetData });
    }
    // console.log(this.packetForm.value)
  }

  initForm() {
    this.packetForm = this.fb.group({
      packetId: [null],
      appraiserId: ['', [Validators.required]],
      multiselect: [null, [Validators.required]]
    })
  }

  action(event): void {
    event ? this.submit() : this.dialogRef.close();
  }

  get controls() {
    return this.packetForm.controls;
  }

  getAllAppraiser() {
    const internalBranchId = this.data.packetData[0].internalUserBranch
    this.appraiserService.getAllAppraiser(internalBranchId).subscribe(res => {
      // const allAppraiser = res.data;
      // this.appraisers = allAppraiser.filter(e => e.internalBranches[0].id == 2)
      this.appraisers = res.data
    })
  }

  submit() {
    if (this.packetForm.invalid) return this.packetForm.markAllAsTouched()

    const packetIdArr = this.controls.multiselect.value.multiSelect.map(e => e.id)
    this.packetForm.patchValue({ packetId: packetIdArr })

    console.log(this.packetForm.value)

    this.packetsService.assignAppraiserToPacket(this.packetForm.value).pipe(map(res => {
      if (res) {
        this.toastr.success('Branch Assigned Successfully')
        this.dialogRef.close(true);
      }
    })).subscribe()
  }

}
