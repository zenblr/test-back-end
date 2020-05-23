
import { Component, OnInit, Inject, Output, EventEmitter, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ToastrComponent } from '../../../../views/partials/components';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { OrderDetailsService } from '../../../../core/emi-management/order-management/order-details/services/order-details.service';

@Component({
  selector: 'kt-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  reportTypes = [];
  minDate = new Date();
  orderId: number
  orderInfo: any;
  orderLogistic = []
  hiddenFlag = false;
  showUploadFile = false;
  showUploadedFile = false;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  constructor(
    private orderDetailsService: OrderDetailsService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.reportTypes = [
      { id: 1, name: 'User Report' },
      { id: 2, name: 'Deposit Report' },
      { id: 3, name: 'EMI Report' },
      { id: 4, name: 'Order Report' },
      { id: 5, name: 'Order Cancel Report' },
      { id: 6, name: 'Label Report' },
      { id: 7, name: 'Products Report' },
      { id: 8, name: 'Franchise Report' }
    ];
    this.formInitialize();
  }

  formInitialize() {
    this.reportForm = this.fb.group({
      reportType: [''],
      startDate: [''],
      endDate: [''],
      merchantId: [''],
      statusId: [''],
    })
    this.setReportTypeValidators();

    this.reportForm.valueChanges.subscribe(val => console.log(val));
  }

  get controls() {
    if (this.reportForm)
      return this.reportForm.controls;
  }

  getOrderLogistic() {
    this.orderDetailsService.getOrderLogistic().subscribe(res => {
      this.orderLogistic = res;
      this.ref.detectChanges();
    });
  }

  setReportTypeValidators() {
    const merchantIdControl = this.reportForm.get('merchantId');
    const statusIdControl = this.reportForm.get('statusId');

    this.reportForm.get('reportType').valueChanges
      .subscribe(val => {
        if (val == '1' || val == '2' || val == '3' || val == '4' || val == '5') {
          merchantIdControl.setValidators([Validators.required]);
        } else {
          merchantIdControl.setValidators([]);
        }
        if (val = '4') {
          statusIdControl.setValidators([Validators.required]);
        } else {
          statusIdControl.setValidators([]);
        }
        merchantIdControl.updateValueAndValidity();
        statusIdControl.updateValueAndValidity();
      });
  }

  submit() {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    console.log(this.reportForm.value);
    if (this.orderId) {
      const orderData = {
        logisticPartnerId: this.controls.logisticPartnerId.value,
        statusId: this.controls.statusId.value,
        trackingId: this.controls.trackingId.value,
        uploadedAwbBox: this.controls.uploadedAwbBox.value,
        uploadedAwbFile: this.controls.uploadedAwbFile.value,
      }
      console.log(orderData);
      this.orderDetailsService.editOrderStatus(orderData, this.orderId).pipe(
        map(res => {
          this.toastr.successToastr('Order Status Updated Sucessfully');
          this.router.navigate(['/emi-management/order-details']);
        }),
        catchError(err => {
          this.toastr.errorToastr(err.error.message)
          throw err;
        })).subscribe();
    }
  }

}
