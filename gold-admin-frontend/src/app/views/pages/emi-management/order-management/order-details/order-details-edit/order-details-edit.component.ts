import { Component, OnInit, Inject, Output, EventEmitter, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ToastrComponent } from '../../../../../../views/partials/components';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { OrderDetailsService } from '../../../../../../core/emi-management/order-management/order-details/services/order-details.service';
import { MerchantService } from '../../../../../../core/user-management/merchant';

@Component({
  selector: 'kt-order-details-edit',
  templateUrl: './order-details-edit.component.html',
  styleUrls: ['./order-details-edit.component.scss']
})
export class OrderDetailsEditComponent implements OnInit {
  viewLoading = false;
  orderForm: FormGroup;
  orderId: number
  orderInfo: any;
  orderLogistic = []
  hiddenFlag = false;
  @Output() next: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  constructor(
    public dialogRef: MatDialogRef<OrderDetailsEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orderDetailsService: OrderDetailsService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private merchantService: MerchantService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private toast: ToastrService,
  ) { }

  ngOnInit() {
    this.formInitialize();
    // this.getStates();
    // this.getStatus();
    this.orderId = this.route.snapshot.params.id;
    if (this.orderId) {
      this.orderDetailsService.getOrderDetails(this.orderId).pipe(
        map(res => {
          this.orderInfo = res;
          this.editOrder();
        }),
        // catchError(err => {
        //   this.toast.error(err.error.error);
        //   throw err;
        // })
      ).subscribe();
    }
  }

  formInitialize() {
    this.orderForm = this.fb.group({
      memberId: [''],
      orderId: [''],
      orderTotalAmount: [''],
      orderInitialAmount: [''],
      emiTenure: [''],
      productName: [''],
      sku: [''],
      emiStartDate: [''],
      emiEndDate: [''],
      logisticPartnerId: ['', Validators.required],
      trackingId: ['', Validators.required],
      statusId: ['', Validators.required],
    })
  }

  get controls() {
    if (this.orderForm)
      return this.orderForm.controls;
  }

  editOrder() {
    console.log(this.orderInfo);
    const data = {
      memberId: this.orderInfo.allOrderData.customerDetails.customerUniqueId,
      orderId: this.orderInfo.allOrderData.orderUniqueId,
      orderTotalAmount: this.orderInfo.allOrderData.orderdetails[0].finalOrderPrice,
      orderInitialAmount: this.orderInfo.allOrderData.orderdetails[0].initialPayment,
      emiTenure: this.orderInfo.allOrderData.paymentType.paymentType,
      productName: this.orderInfo.allOrderData.product.productName,
      sku: this.orderInfo.allOrderData.product.sku,
      emiStartDate: this.orderInfo.emiStartDate,
      emiEndDate: this.orderInfo.emiLastDate,
    }
    this.orderForm.patchValue(data);

    if (this.orderInfo.trackingDetails && this.orderInfo.trackingDetails.trackingId) {
      this.orderForm.controls['trackingId'].patchValue(this.orderInfo.trackingDetails.trackingId);
    }
    if (this.orderInfo.trackingDetails && this.orderInfo.trackingDetails.logisticPartnerId) {
      this.orderForm.controls['logisticPartnerId'].patchValue(this.orderInfo.trackingDetails.logisticPartnerId);
    }

    switch (this.orderInfo.currentStatus.statusId) {
      case 5: this.hiddenFlag = false;
        this.getOrderLogistic();
        break;
      case 6: this.hiddenFlag = false;
        this.getOrderLogistic();
        this.orderForm.controls['trackingId'].disable();
        this.orderForm.controls['logisticPartnerId'].disable();
        break;
      default: this.hiddenFlag = true;
        this.orderForm.disable();
        break;
    }

    console.log(this.orderForm.value);
    this.ref.detectChanges();
  }

  getOrderLogistic() {
    this.orderDetailsService.getOrderLogistic().subscribe(res => {
      this.orderLogistic = res;
      this.ref.detectChanges();
    });
  }

  submit() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    console.log(this.orderForm.value)
    if (this.orderId) {
      this.merchantService.editMerchant(this.orderForm.value, this.orderId).pipe(
        map(res => {
          console.log(res);
          this.next.emit(true);
        }),
        catchError(err => {
          this.toastr.errorToastr(err.error.message)
          throw err;
        })).subscribe()
    }
  }
}
