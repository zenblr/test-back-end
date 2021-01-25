import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoanSettingsService } from '../../../../../core/loan-setting';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-rpg-edit',
  templateUrl: './rpg-edit.component.html',
  styleUrls: ['./rpg-edit.component.scss']
})
export class RpgEditComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RpgEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private loanSettingService:LoanSettingsService,
    private toast:ToastrService) { }

  rpgEditForm: FormGroup

  ngOnInit() {
    console.log(this.data)
    this.rpgEditForm = this.fb.group({
      id: [],
      rpg: ['', Validators.required],
      schemeName: []
    })
    this.rpgEditForm.patchValue(this.data)
  }

  onSubmit(){
    if(this.rpgEditForm.invalid){
      this.rpgEditForm.markAllAsTouched()
      return
    }
    this.loanSettingService.editRpg(this.rpgEditForm.value).subscribe(res=>{
      this.toast.success("Updated")
      this.dialogRef.close(res)
      
    })
  }

  action(event: Event) {
    if (event) {
      this.onSubmit()
    }
    else if (!event) {
      this.dialogRef.close()
    }
  }
}
