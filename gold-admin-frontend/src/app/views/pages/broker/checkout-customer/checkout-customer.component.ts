import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'kt-checkout-customer',
  templateUrl: './checkout-customer.component.html',
  styleUrls: ['./checkout-customer.component.scss']
})
export class CheckoutCustomerComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  viewLoading = false;
  checkoutCustomerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.formInitialize();
  }

  formInitialize() {
    this.checkoutCustomerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      landMark: ['', Validators.required],
      postalCode: ['', Validators.required],
      countryName: [''],
      stateName: ['', Validators.required],
      cityName: ['', Validators.required],
      blockId: ['', Validators.required],
    });

    this.checkoutCustomerForm.valueChanges.subscribe((val) => console.log(val));
  }

  checkCustomerType(type) {
    
  }
}
