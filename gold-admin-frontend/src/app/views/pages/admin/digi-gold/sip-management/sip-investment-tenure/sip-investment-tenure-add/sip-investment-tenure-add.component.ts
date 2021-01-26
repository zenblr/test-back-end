import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { SipInvestmentTenureDatasource, SipInvestmentTenureService } from '../../../../../../../core/sip-management/sip-investment-tenure';
import { map, tap, catchError } from "rxjs/operators";

@Component({
  selector: 'kt-sip-investment-tenure-add',
  templateUrl: './sip-investment-tenure-add.component.html',
  styleUrls: ['./sip-investment-tenure-add.component.scss']
})
export class SipInvestmentTenureAddComponent implements OnInit {

  SipInvestmentTenureForm: FormGroup;
  title: string;
  investmentTenureList: any;
  statusList = [
		{ value: 'active', name: 'ACTIVE' },
		{ value: 'inactive', name: 'IN-ACTIVE' },
  ];
  // investmentTenureList = [
  //   { value: '6 month', name: '6 month' },
  //   { value: '1 year', name: '1 year' },
  //   { value: '2 year', name: '2 year' },
  //   { value: '3 year', name: '3 year' },
  //   { value: '4 year', name: '4 year' },
  //   { value: '5 year', name: '5 year' },
  //   { value: '6 year', name: '6 year' },
  //   { value: '7 year', name: '7 year' },
  //   { value: '8 year', name: '8 year' },
  //   { value: '9 year', name: '9 year' },
  //   { value: '10 year', name: '10 year' },
  //   { value: '11 year', name: '11 year' },
  //   { value: '12 year', name: '12 year' },
  // ];
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
    this.getStatus();
  }

  setForm() {
    console.log(this.data)
    if (this.data.action == 'add') {
      this.title = 'Add Investment Tenure'
    } else if (this.data.action == 'edit') {
      this.title = 'Edit Investment Tenure'
      this.SipInvestmentTenureForm.patchValue(this.data.sipInvestmentTenure)
    }
  }

  initForm() {
    this.SipInvestmentTenureForm = this.fb.group({
      id: [],
      investmentTenure: ['', [Validators.required]],
      investmentTenureStatus: ['', [Validators.required]],
     
    })
  }

  action(event) {
    if (event) {
      this.onSubmit();
    } else if (!event) {
      this.dialogRef.close();
    }
  }
  getStatus() {
    const queryParamsData = {
      inactive: 'inactive'
    }
    this.sipInvestmentTenureService.getInvestmentTenure(queryParamsData).pipe(
      map(res =>{
        // this.statusList = res.data;
        this.investmentTenureList = res.data;
      })
      ).subscribe()   
  }

  onSubmit() {
    if (this.SipInvestmentTenureForm.invalid) {
      this.SipInvestmentTenureForm.markAllAsTouched()
      return
    }
    const id = this.controls.id.value;

    if (this.data.action == 'edit') {
      this.sipInvestmentTenureService.updateInvestmentTenure(id, this.SipInvestmentTenureForm.value).subscribe(res => {
        if (res) {
          const msg = 'Lead Updated Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });

    } else {
      this.sipInvestmentTenureService.addInvestmentTenure( this.SipInvestmentTenureForm.value).subscribe(res => {
        if (res) {
          const msg = 'SIP Investment Tenure Added Successfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
    }
  }

  get controls() {
    return this.SipInvestmentTenureForm.controls;
  }


}
