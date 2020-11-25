import { Component, OnInit, OnDestroy, ViewChild, NgZone, ChangeDetectorRef, Inject } from '@angular/core';
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SipApplicationService } from '../../../../../core/sip-management/sip-application';
import { from } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { map, tap, catchError } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'kt-create-sip',
  templateUrl: './create-sip.component.html',
  styleUrls: ['./create-sip.component.scss']
})
export class CreateSipComponent implements OnInit {

 
  createSipForm: FormGroup;
  title: string;
  cycleDate: any;
  investmentTenure: any;
  customerName: any;
  id: any;
  metalType = [
		{ value: 'gold', name: 'Gold' },
		{ value: 'silver', name: 'Silver' },
  ];

  constructor(
    public dialogRef: MatDialogRef<CreateSipComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private router: Router,
    private sipApplicationService: SipApplicationService,
    private toastr: ToastrService
  
  ) { }

  ngOnInit() {
    this.initForm();
    this.setForm();
    this.getAllCycleDate();
    this.getAllInvestmentTenure();
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
      id: [],
      customerName: ['', [Validators.required]],
      customerUniqueId: ['', [Validators.required]],
      applicationDate: [new Date(), [Validators.required]],
      mobileNumber: [, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      metalType: ['', [Validators.required]],
      sipInvestmentTenure: ['', [Validators.required]],
      sipCycleDate: ['', [Validators.required]],
      investmentAmount: ['', [Validators.required]],
      uploadEcsForm: ['', [Validators.required]],
      source: ['web'],
      customerId: []

     
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

  getAllCycleDate() { 
    this.sipApplicationService.getAllCycleDate().pipe(
      map(res =>{
        this.cycleDate = res;
      })
      ).subscribe()   
  }

  getAllInvestmentTenure() {
    
    this.sipApplicationService.getAllInvestmentTenure().pipe(
      map(res =>{
        this.investmentTenure = res;
      })
      ).subscribe()   
  }
  inputNumber() {
    if (this.controls.mobileNumber.valid) {
     this.sipApplicationService.addMobile(this.controls.mobileNumber.value).pipe(
      map(res =>{
        // this.custometerId = res.id
        this.customerName = res.firstName+ ' ' + res.lastName;
        this.controls.customerName.patchValue(this.customerName);
        this.controls.customerUniqueId.patchValue(res.customerUniqueId)
        this.controls.customerId.patchValue(res.id)
      })
      ).subscribe()   
    }
  }

  submit() {
    if (this.createSipForm.invalid) {
      this.createSipForm.markAllAsTouched();
      return;
    }

    if (this.data.action == 'add') {
      this.sipApplicationService.addSipApplication(this.createSipForm.value).subscribe(res => {
        if (res) {
          const msg = 'SIP Application Created Sucessfully';
          this.toastr.success(msg);
          this.dialogRef.close(true);
        }
      });
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
}
