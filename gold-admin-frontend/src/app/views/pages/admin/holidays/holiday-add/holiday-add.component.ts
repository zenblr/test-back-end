import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HolidayService } from '../../../../../core/holidays/services/holiday.service';
import { map, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'kt-holiday-add',
  templateUrl: './holiday-add.component.html',
  styleUrls: ['./holiday-add.component.scss']
})
export class HolidayAddComponent implements OnInit {

  fillingForm: FormGroup
  csvForm: FormGroup;
  file: any;
  @ViewChild('tabGroup', { static: false }) tabGroup;
  title: string;
  disableCsv = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<HolidayAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private holidayService: HolidayService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initForm()
    this.setForm()
  }

  ngAfterViewChecked() {
    this.ref.detectChanges();
  }

  setForm() {
    if (this.data.action == 'add') {
      this.title = "Add Holiday";
      // this.button = "Add";
    } else {
      // this.button = "Update";
      this.title = "Edit Holiday";
      this.fillingForm.patchValue(this.data.holidayData);
      setTimeout(() => this.disableCsv = true);
      console.log(this.data)
    }
  }

  initForm() {
    this.fillingForm = this.fb.group({
      holidayDate: [, Validators.required],
      description: [, Validators.required],
      year: [],
      id: []
    })

    this.csvForm = this.fb.group({
      csv: ['', Validators.required]
    })
  }

  getFileInfo(event) {
    this.file = event.target.files[0];
    var ext = event.target.files[0].name.split('.');
    if (ext[ext.length - 1] != 'csv') {
      this.toastr.error('Please upload csv file');
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
    if (this.tabGroup.selectedIndex == 0) {
      console.log(this.fillingForm.value);

      if (this.fillingForm.invalid) {
        this.fillingForm.markAllAsTouched()
        return
      }

      this.fillingForm.value.holidayDate =
        new Date(
          this.fillingForm.value.holidayDate.getTime()
          - this.fillingForm.value.holidayDate.getTimezoneOffset() * 60000
        ).toISOString();

      if (this.data.action == 'add') {
        this.holidayService.addHoliday(this.fillingForm.value).pipe(
          map((res) => {
            this.toastr.success('Holiday Created Sucessfully');
            this.dialogRef.close(res);
          }), catchError(err => {
            this.ref.detectChanges();
            throw (err)
          })).subscribe()
      }
      else {

        this.holidayService.editHoliday(this.fillingForm.value).pipe(
          map((res) => {
            this.toastr.success('Holiday Created Sucessfully');
            this.dialogRef.close(res);
          }), catchError(err => {
            this.ref.detectChanges();
            throw (err)
          })).subscribe()
      }
    } else if (this.tabGroup.selectedIndex == 1) {
      if (this.csvForm.invalid) {
        this.csvForm.markAllAsTouched()
        return
      }
      var fb = new FormData()
      fb.append('holidaylist', this.file)
      this.holidayService.uploadCSV(fb).pipe(
        map((res) => {
          this.toastr.success('Holiday uploaded Sucessfully');
          this.dialogRef.close(res);
        }), catchError(err => {

          this.ref.detectChanges();
          throw (err)
        })).subscribe()
    }
  }

  patchyear() {
    const selectedYear = this.fillingForm.controls.holidayDate.value;
    // console.log(new Date(selectedYear).getFullYear())
    this.fillingForm.controls.year.patchValue(new Date(selectedYear).getFullYear())
  }
}
