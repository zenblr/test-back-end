import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { KaratDetailsService } from '../../../../../../core/loan-setting/karat-details/services/karat-details.service'
import { PathLocationStrategy } from '@angular/common';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'kt-add-karat-details',
  templateUrl: './add-karat-details.component.html',
  styleUrls: ['./add-karat-details.component.scss']
})
export class AddKaratDetailsComponent implements OnInit {
  karatDetailsForm: FormGroup;
  title: string;
  isMandatory = false;

  constructor(public dialogRef: MatDialogRef<AddKaratDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private karatDetailsService: KaratDetailsService,
    private toast: ToastrService) { }

  ngOnInit() {
    this.formInitialize();
    if (this.data.action !== 'add') {
      this.getKaratDetailsById(this.data['karatDetailsId']);
      this.title = 'Edit Karat Details'
      this.isMandatory = true
    }
    else {
      this.title = 'Add Karat Details'
      this.isMandatory = true
    }

  }
  formInitialize() {
    this.karatDetailsForm = this.fb.group({
      id: [''],
      karat: ['', [Validators.required, Validators.pattern('^\\d{1}$|^[1]{1}\\d{1}$|^[2]{1}[0-4]{1}$')]],
      fromPercentage: ['', [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      toPercentage: ['', [Validators.required, Validators.pattern('(^100(\\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\\.[0-9]{1,2})?$)')]],
      range: [],
      hm: [false]
    });
  }
  getKaratDetailsById(id) {
    this.karatDetailsService.getKaratDetailsById(id).subscribe(res => {
      this.karatDetailsForm.patchValue(res.data.readKaratDetailsById);
      this.karatDetailsForm.patchValue({
        karat: this.truncateKHM()
      })
      console.log(this.karatDetailsForm.value);
    },
      error => {
        // console.log(error.error.message);
      })
  }
  get controls() {
    return this.karatDetailsForm.controls;
  }
  action(event: Event) {
    if (event) {
      this.onSubmit()
    }
    else if (!event) {
      this.dialogRef.close()
    }
  }
  onSubmit() {
    if (this.karatDetailsForm.invalid) {
      this.karatDetailsForm.markAllAsTouched()
      return
    }

    const from = Number(this.karatDetailsForm.controls.fromPercentage.value);
    const to = Number(this.karatDetailsForm.controls.toPercentage.value);
    var range = [];

    for (let index = from; index <= to; index++) {
      range.push(+(index));
    }
    this.karatDetailsForm.patchValue({ range: range, fromPercentage: from, toPercentage: to });
    console.log(this.karatDetailsForm.value)
    let karatData = this.karatDetailsForm.value;
    karatData.karat = this.appendKHM()

    if (this.data.action == 'edit') {
      const id = this.controls.id.value;
      // this.karatDetailsForm.patchValue({
      //   karat: this.truncateKHM(),
      // })
      // return
      this.karatDetailsService.updateKaratDetails(id, karatData).pipe(finalize(() => {
        // this.karatDetailsForm.patchValue({
        //   karat: this.truncateKHM(),
        // })
      })).subscribe(res => {
        if (res) {
          const msg = 'Karat Details Updated Successfully'
          this.toast.success(msg);
          this.dialogRef.close(true);

        }
      });
    }
    else {
      // this.karatDetailsForm.patchValue({
      //   karat: this.truncateKHM(),
      // })
      // return
      this.karatDetailsService.addKaratDetails(karatData).pipe(finalize(() => {
        // this.karatDetailsForm.patchValue({
        //   karat: this.truncateKHM(),
        // })
        console.log(this.karatDetailsForm.value)
      })).subscribe(res => {
        if (res) {
          const msg = 'Karat Details added successFully';
          this.toast.success(msg);
          this.dialogRef.close(true);
        }
      })
    }
  }

  checkPercent() {

    if (Number(this.controls.fromPercentage.value) >= Number(this.controls.toPercentage.value)) {
      if (Number(this.controls.toPercentage.value) == 100) {
        this.controls.fromPercentage.setErrors({ mustBeLesser: true })
      } else {
        this.controls.toPercentage.setErrors({ mustBeGreater: true })
      }
    }
  }

  appendKHM() {
    let karat = this.controls.karat.value
    let karatString = karat + ' K' + (this.controls.hm.value ? ' HM' : '')
    console.log(karatString)
    return karatString
  }

  truncateKHM() {
    let karat = this.controls.karat.value
    let karatValue = karat.toString().split(' ')
    // if (karatValue.length === 1) return
    console.log(karatValue[0])
    return karatValue[0]
  }
}