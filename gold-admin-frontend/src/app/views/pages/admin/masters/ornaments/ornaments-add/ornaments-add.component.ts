import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { OrnamentsService } from '../../../../../../core/masters/ornaments/services/ornaments.service';

@Component({
  selector: 'kt-ornaments-add',
  templateUrl: './ornaments-add.component.html',
  styleUrls: ['./ornaments-add.component.scss']
})
export class OrnamentsAddComponent implements OnInit {

  ornamentForm: FormGroup;
  title: string;
  constructor(
    public dialogRef: MatDialogRef<OrnamentsAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ornamentsService: OrnamentsService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }

  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add Ornament'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Ornament'
      this.ornamentForm.patchValue(this.data.ornamentData);
    }
  }

  initForm() {
    this.ornamentForm = this.fb.group({
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
    if (this.ornamentForm.invalid) {
      this.ornamentForm.markAllAsTouched()
      return
    }
    const data = this.ornamentForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.ornamentsService.updateOrnaments(id, data.name).subscribe(res => {
        if (res) {
          const msg = 'Ornament Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.ornamentsService.addOrnaments(data.name).subscribe(res => {
        if (res) {
          const msg = 'Ornament Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.ornamentForm.controls;
  }

}
