import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { OccupationService } from '../../../../../../core/masters/occupation/services/occupation.service';

@Component({
  selector: 'kt-occupation-add',
  templateUrl: './occupation-add.component.html',
  styleUrls: ['./occupation-add.component.scss']
})
export class OccupationAddComponent implements OnInit {

  occupationForm: FormGroup;
  title: string;
  constructor(
    public dialogRef: MatDialogRef<OccupationAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private occupationService: OccupationService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }

  setForm() {
    if (this.data.action == 'add') {
      this.title = 'Add Occupation'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Occupation'
      this.occupationForm.patchValue(this.data.occupation);
    }
  }

  initForm() {
    this.occupationForm = this.fb.group({
      id: [],
      name: ['', [Validators.required]]
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
    if (this.occupationForm.invalid) {
      this.occupationForm.markAllAsTouched()
      return
    }
    const data = this.occupationForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.occupationService.updateOccupation(id, data).subscribe(res => {
        if (res) {
          const msg = 'Occupation Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.occupationService.addOccupation(data).subscribe(res => {
        if (res) {
          const msg = 'Occupation Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.occupationForm.controls;
  }

}
