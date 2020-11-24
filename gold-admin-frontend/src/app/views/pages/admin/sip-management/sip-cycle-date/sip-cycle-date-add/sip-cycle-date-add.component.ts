import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { SipCycleDateDatasource, SipCycleDateService } from '../../../../../../core/sip-management/sip-cycle-date';
import { map, tap, catchError } from "rxjs/operators";
@Component({
  selector: 'kt-sip-cycle-date-add',
  templateUrl: './sip-cycle-date-add.component.html',
  styleUrls: ['./sip-cycle-date-add.component.scss']
})
export class SipCycleDateAddComponent implements OnInit {

  SipCycleDateForm: FormGroup;
  title: string;
  // statusList: any;
  cycleDate: any;
 
  statusList = [
		{ value: 'active', name: 'ACTIVE' },
		{ value: 'inactive', name: 'IN-ACTIVE' },
  ];
  // cycleDate = [
  //   { value: '1', name: '1' },
  //   { value: '2', name: '2' },
  //   { value: '3', name: '3' },
  //   { value: '4', name: '4' },
  //   { value: '5', name: '5' },
  //   { value: '6', name: '6' },
  //   { value: '7', name: '7' },
  //   { value: '8', name: '8' },
  //   { value: '9', name: '9' },
  //   { value: '10', name: '10' },
  //   { value: '11', name: '11' },
  //   { value: '12', name: '12' },
  //   { value: '13', name: '13' },
  //   { value: '14', name: '14' },
  //   { value: '15', name: '15' },
  //   { value: '16', name: '16' },
  //   { value: '17', name: '17' },
  //   { value: '18', name: '18' },
  //   { value: '19', name: '19' },
  //   { value: '20', name: '20' },
  //   { value: '21', name: '21' },
  //   { value: '22', name: '22' },
  //   { value: '23', name: '23' },
  //   { value: '24', name: '24' },
  //   { value: '25', name: '25' },
  //   { value: '26', name: '26' },
  //   { value: '27', name: '27' },
  //   { value: '28', name: '28' },
  //   { value: '29', name: '29' },
	// 	{ value: '30', name: '30' },
  // ];

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
      this.title = 'Add Cycle Date'
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
    
    this.sipCycleDateService.getCycleDate('','','','inactive').pipe(
      map(res =>{
        // this.statusList = res.data;
        this.cycleDate = res.data;
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
