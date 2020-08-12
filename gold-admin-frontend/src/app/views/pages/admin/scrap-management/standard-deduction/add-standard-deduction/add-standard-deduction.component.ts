import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StandardDeductionService } from '../../../../../../core/scrap-management/standard-deduction/service/standard-deduction.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-add-standard-deduction',
  templateUrl: './add-standard-deduction.component.html',
  styleUrls: ['./add-standard-deduction.component.scss']
})
export class AddStandardDeductionComponent implements OnInit {
  standardDeductionForm: FormGroup
  title: string;
  button: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddStandardDeductionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private standardDeductionService: StandardDeductionService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setTitle();
  }

  initForm() {
    this.standardDeductionForm = this.fb.group({
      standardDeduction: ['', [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$'), Validators.max(100)]],
    })
  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = "Add Standard Deduction";
      this.button = "Add";
    } else {
      this.button = "Update";
      this.title = "Edit Standard Deduction";
      this.controls.standardDeduction.patchValue(this.data.standardDeductionData.standardDeduction);
      console.log(this.data);
    }
  }

  get controls() {
    return this.standardDeductionForm.controls;
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

  onSubmit() {
    if (this.standardDeductionForm.invalid) {
      this.standardDeductionForm.markAllAsTouched();
      return;
    }
    if (this.data.action == 'edit') {
      this.standardDeductionService.updateStandardDeduction(this.data.standardDeductionData.id, this.controls.standardDeduction.value).subscribe(res => {
        if (res) {
          const msg = 'Standard Deduction Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    } else {
      this.standardDeductionService.addStandardDeduction(this.controls.standardDeduction.value).subscribe(res => {
        if (res) {
          const msg = 'Standard Deduction Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }
}
