import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { SipInvestmentTenureService } from '../../../../..';


@Component({
  selector: 'kt-sip-investment-tenure-add',
  templateUrl: './sip-investment-tenure-add.component.html',
  styleUrls: ['./sip-investment-tenure-add.component.scss']
})
export class SipInvestmentTenureAddComponent implements OnInit {

  leadSourceForm: FormGroup;
  title: string;
  constructor(
    public dialogRef: MatDialogRef<SipInvestmentTenureAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sipInvestmentTenureService: SipInvestmentTenureService
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }

  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add Lead Source'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Lead Source'
      this.leadSourceForm.patchValue(this.data.leadSourceData);
    }
  }

  initForm() {
    this.leadSourceForm = this.fb.group({
      id: [],
      leadName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      // source: ['', [Validators.required]],
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
    if (this.leadSourceForm.invalid) {
      this.leadSourceForm.markAllAsTouched()
      return
    }
    const data = this.leadSourceForm.value;
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.sipInvestmentTenureService.updateLeadSource(id, data.leadName).subscribe(res => {
        if (res) {
          const msg = 'Lead Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.sipInvestmentTenureService.addLeadSource(data.leadName).subscribe(res => {
        if (res) {
          const msg = 'Lead Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.leadSourceForm.controls;
  }


}
