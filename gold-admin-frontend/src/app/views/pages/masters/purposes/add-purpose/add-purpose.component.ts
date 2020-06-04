import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PurposeService } from '../../../../../core/masters/purposes/service/purpose.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-add-purpose',
  templateUrl: './add-purpose.component.html',
  styleUrls: ['./add-purpose.component.scss']
})
export class AddPurposeComponent implements OnInit {

  purposeForm: FormGroup
  title: string;
  button: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddPurposeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private purposeService:PurposeService,
    private toastr:ToastrService
  ) { }

  ngOnInit() {
    console.log(this.data)
    this.initForm()
    this.setTitle()
  }

  initForm() {
    this.purposeForm = this.fb.group({
      purposeName: ['', Validators.required]
    })
  }

  setTitle() {
    if (this.data.action == 'add') {
      this.title = "Add Purpose";
      this.button = "Add";
    } else {
      this.button = "Update";
      this.title = "Edit Purpose"
    }
  }

  get controls() {
    return this.purposeForm.controls
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }

    onSubmit(){
      if(this.purposeForm.invalid){
        this.purposeForm.markAllAsTouched()
        return
      }
      
      if (this.data.action == 'edit') {
        // this.purposeService.updatePurpose(id, data).subscribe(res => {
        //   if (res) {
        //     const msg = 'Purpose Updated Sucessfully';
        //     this.toastr.success(msg);
        //     this.dialogRef.close(true);
        //   }
        // });
  
      } else {
        // this.purposeService.addPurpose(data).subscribe(res => {
        //   if (res) {
        //     const msg = 'Purpose Added Successfully';
        //     this.toastr.success(msg);
        //     this.dialogRef.close(true);
        //   }
        // });
      }

    }

}

