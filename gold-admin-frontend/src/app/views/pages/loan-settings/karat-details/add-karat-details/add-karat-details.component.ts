import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { KaratDetailsService } from '../../../../../core/loan-setting/karat-details/services/karat-details.service'
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
      karat: ['', [Validators.required]],
      percentage: ['', [Validators.required,Validators.pattern('(?<![\\d.])(\\d{1,2}|\\d{0,2}\\.\\d{1,2})?(?![\\d.])|(100)'
      )]]
    });
  }
  getKaratDetailsById(id) {
    this.karatDetailsService.getKaratDetailsById(id).subscribe(res => {
      this.karatDetailsForm.patchValue(res);
    },
      error => {
        console.log(error.error.message);
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
    const karatData = this.karatDetailsForm.value;
    if (this.data.action == 'edit') {
      const id = this.controls.id.value;
      this.karatDetailsService.updateKaratDetails(id, karatData).subscribe(res => {
        if (res) {
          const msg = ' Karat Details Updated SuccessFully'
          this.toast.success(msg);
          this.dialogRef.close(true);

        }
      });
    }
    else {
      this.karatDetailsService.addKaratDetails(karatData).subscribe(res => {
        if (res) {
          const msg = ' Karat Details added successFully';
          this.toast.success(msg);
          this.dialogRef.close(true);
        }
      })
    }
  }

}