import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { ScrapPacketsService } from '../../../../../../core/scrap-management';
import { AppraiserService } from '../../../../../../core/user-management/appraiser';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kt-assign-appraiser-packets',
  templateUrl: './assign-appraiser-packets.component.html',
  styleUrls: ['./assign-appraiser-packets.component.scss']
})
export class AssignAppraiserPacketsComponent implements OnInit {
  packetForm: FormGroup;
  appraisers: any;

  constructor(
    public dialogRef: MatDialogRef<AssignAppraiserPacketsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private scrapPacketsService: ScrapPacketsService,
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
    const internalBranchId = this.data.packetData[0].internalBranch.id
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

    this.scrapPacketsService.assignAppraiserToPacket(this.packetForm.value).pipe(map(res => {
      if (res) {
        this.toastr.success('Appraiser Assigned Successfully')
        this.dialogRef.close(true);
      }
    })).subscribe()
  }

}
