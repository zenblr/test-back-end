import { Component, OnInit, OnDestroy, ViewChild, NgZone, ChangeDetectorRef, Inject } from '@angular/core';
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreateSipService } from '../../../../../core/sip-management';
import { from } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'kt-create-sip',
  templateUrl: './create-sip.component.html',
  styleUrls: ['./create-sip.component.scss']
})
export class CreateSipComponent implements OnInit {

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  createSipForm: FormGroup;
  title: string;
  
  minDate = new Date();
	maxDate = new Date();

  constructor(
    public dialogRef: MatDialogRef<CreateSipComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private router: Router,
  
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
  }
  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add SIP'
    }
    else if (this.data.action == 'edit') {
      this.title = 'Edit SIP';
      this.createSipForm.patchValue(this.data.sipCreateData)
    }
  }

  initForm() {
    this.createSipForm = this.fb.group({
      customerName: ['', [Validators.required]],
      customerId: ['', [Validators.required]],
      applicationDate: ['', [Validators.required]],
      metalType: ['', [Validators.required]],
      sipInvestmentTenure: ['', [Validators.required]],
      sipCycleDate: ['', [Validators.required]],
      investmentAmount: ['', [Validators.required]],
      uploadEcsForm: ['', [Validators.required]],
      downloadEcsForm: ['', [Validators.required]],
    });
    this.createSipForm.valueChanges.subscribe(val => console.log(val));
  }

  get controls() {
    if (this.createSipForm) {
      return this.createSipForm.controls;
    }
  }
  action(event) {
    if (event) {
      this.submit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }


  submit() {
    if (this.createSipForm.invalid) {
      this.createSipForm.markAllAsTouched();
      return;
    }
    const id = this.controls.id.value;

    if (this.data.action == 'add') {
      // this.sipCycleDateService.updateCycleDate(id, this.SipCycleDateForm.value).subscribe(res => {
      //   if (res) {
      //     const msg = 'Sip Cycle Date Updated Sucessfully';
      //     this.toastr.success(msg);
      //     this.dialogRef.close(true);
      //   }
      // });
    }
    else {
      // this.sipCycleDateService.addCycleDate(this.SipCycleDateForm.value).subscribe(res => {
      //   if (res) {
      //     const msg = 'Sip Cycle Date Added Successfully';
      //     this.toastr.success(msg);
      //     this.dialogRef.close(true);
      //   }
      // });
    }
    
  }
  createSip() {
      this.router.navigate(['admin/sip-management/sip-application']);
  }

}
