import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'kt-un-secured-scheme',
  templateUrl: './un-secured-scheme.component.html',
  styleUrls: ['./un-secured-scheme.component.scss']
})
export class UnSecuredSchemeComponent implements OnInit {
  unsecuredSchemeForm: FormGroup;
  unsecuredSchemes = [{ id: 1, name: 'Micro Scheme' }, { id: 2, name: 'Future Scheme' }, { id: 3, name: 'Emerging Scheme' },]
  details:any;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UnSecuredSchemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.initForm()
    this.unsecuredSchemeForm.patchValue(this.data.unsecuredSchemeForm)
    this.details = this.data.unsecuredSchemeForm
    console.log(this.details)
  }

  initForm() {
    this.unsecuredSchemeForm = this.fb.group({
      unsecuredSchemeName: [''],
      unsecuredSchemeAmount: [''],
      unsecuredSchemeInterest: [''],
    });
  }

  get controls() {
    return this.unsecuredSchemeForm.controls;
  }

  closeModal() {
    this.dialogRef.close();
  }

  action(event) {
    if (event) {
      // this.onSubmit();
    } else if (!event) {
      this.closeModal();
    }
  }

  calculate() {

  }
}
