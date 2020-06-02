import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-holiday-add',
  templateUrl: './holiday-add.component.html',
  styleUrls: ['./holiday-add.component.scss']
})
export class HolidayAddComponent implements OnInit {

  fillingForm: FormGroup
  csvForm: FormGroup;
  file: any;

  constructor(
    private fb: FormBuilder,
    private _toastr: ToastrService,
    public dialogRef: MatDialogRef<HolidayAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.fillingForm = this.fb.group({
      date: [, Validators.required],
      event: [, Validators.required],
    })

    this.csvForm = this.fb.group({
      csv: ['', Validators.required]
    })
  }

  getFileInfo(event) {
    this.file = event.target.files[0];
    var ext = event.target.files[0].name.split('.');
    if (ext[ext.length - 1] != 'csv') {
      this._toastr.error('Please upload csv file');
      this.csvForm.controls.csv.markAsTouched()
      return
    }
    this.csvForm.get('csv').patchValue(event.target.files[0].name);
  }

  action(event: Event) {
    if (event) {
      this.submit()
    } else if (!event) {
      this.dialogRef.close()
    }
  }

  submit() {

  }
}
