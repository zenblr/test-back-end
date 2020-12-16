import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { SipCycleDateService } from '../../../../../../../core/sip-management/sip-cycle-date';
import { map, tap, catchError } from "rxjs/operators";

@Component({
  selector: 'kt-sip-cycle-date-add',
  templateUrl: './sip-cycle-date-add.component.html',
  styleUrls: ['./sip-cycle-date-add.component.scss']
})
export class SipCycleDateAddComponent implements OnInit {
  SipCycleDateForm: FormGroup;
  title: string;
  cycleDateList: any;
  statusList = [
    { value: 'active', name: 'ACTIVE' },
    { value: 'inactive', name: 'IN-ACTIVE' },
  ];
  queryParamsData = {
    cycleDateStatus: 'inactive'
  }

  constructor(
    public dialogRef: MatDialogRef<SipCycleDateAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sipCycleDateService: SipCycleDateService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
    this.getStatus();
  }

  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add Cycle Date';
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Cycle Date';
      // this.SipCycleDateForm.patchValue()
      this.SipCycleDateForm.patchValue(this.data.sipCycleData);
      // this.SipCycleDateForm.controls.cycleDate.patchValue(this.data.sipCycleData.cycleDate);
    }
  }

  initForm() {
    this.SipCycleDateForm = this.fb.group({
      id: [],
      cycleDate: ['', [Validators.required]],
      cycleDateStatus: ['', [Validators.required]],
    })
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  getStatus() {
    this.sipCycleDateService.getCycleDate(this.queryParamsData).pipe(
      map(res => {
        this.cycleDateList = res.data;
      })
    ).subscribe()
  }

  onSubmit() {
    if (this.SipCycleDateForm.invalid) {
      this.SipCycleDateForm.markAllAsTouched()
      return
    }
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.sipCycleDateService.updateCycleDate(id, this.SipCycleDateForm.value).subscribe(res => {
        if (res) {
          const msg = 'Sip Cycle Date Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.sipCycleDateService.addCycleDate(this.SipCycleDateForm.value).subscribe(res => {
        if (res) {
          const msg = 'Sip Cycle Date Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.SipCycleDateForm.controls;
  }


}
