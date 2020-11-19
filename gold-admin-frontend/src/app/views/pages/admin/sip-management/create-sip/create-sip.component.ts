import { Component, OnInit, OnDestroy, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CreateSipService } from '../../../../../core/sip-management';
import { from } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'kt-create-sip',
  templateUrl: './create-sip.component.html',
  styleUrls: ['./create-sip.component.scss']
})
export class CreateSipComponent implements OnInit {

  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  createSipForm: FormGroup;
  
  minDate = new Date();
	maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private router: Router,
  
  ) { }

  ngOnInit() {
    this.initForm();
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

  submit() {
    if (this.createSipForm.invalid) {
      this.createSipForm.markAllAsTouched();
      return;
    }
    // this.contactService.PostMessage(this.contactForm.value).pipe(
    //   map(res => {
    //     this.toastr.successToastr(res.message);
    //     this.router.navigate(['/']);
    //   }), catchError(err => {
    //     this.toastr.errorToastr(err.error.message);
    //     throw err;
    //   })).subscribe();
  }
  createSip() {
      this.router.navigate(['admin/sip-management/sip-application']);
  }

}
