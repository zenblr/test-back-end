import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrComponent } from '../../../../../../views/partials/components/toastr/toastr.component';
import { ActivatedRoute, Router } from "@angular/router";
import { OrderDetailsService } from '../../../../../../core/emi-management/order-management';

@Component({
  selector: 'kt-order-cancel-dialog',
  templateUrl: './order-cancel-dialog.component.html',
  styleUrls: ['./order-cancel-dialog.component.scss']
})
export class OrderCancelDialogComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  cancelForm: FormGroup;
  title: string = 'Cancel Order';
  orderId: number;
  cancelData: any;
  isMandatory = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private orderService: OrderDetailsService,
    private chRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.formInitialize();
    this.orderService.getCancelOrderPrice(this.orderId).subscribe(res => {
      this.cancelData = res;
      this.bindValue(res);
    });
    this.chRef.detectChanges();
  }
  formInitialize() {
    this.cancelForm = this.fb.group({
      storeId: [''],
      orderId: [''],
      userId: [''],
      customerName: [''],
      mobileNumber: [''],
      bookingPrice: [''],
      totalAmt: [''],
      cancellationPrice: [''],
      differenceAmt: [''],
      totalCancellationCharges: [''],
      amtPayable: [''],
      customerBankName: ['', Validators.required],
      customerAccountNo: ['', Validators.required],
      ifscCode: ['', Validators.required],
      cancellationCharges: ['', Validators.required],
      passbookId: [0],
      checkCopyId: [0],
      status: ['']
    });
  }

  get controls() {
    return this.cancelForm.controls;
  }

  bindValue(value) {
    const data = {
      storeId: value.storeID,
      userId: value.customer.customerUniqueId,
      customerName: value.customer.firstName,
      mobileNumber: value.customer.mobileNumber,
      orderId: value.orderId,
      bookingPrice: value.totalPrice,
      totalAmt: value.totalAmountPaid,
      cancellationPrice: value.cancelationPriceOfOrder,
      differenceAmt: value.diffrenceAmount,
      totalCancellationCharges: value.totalCancelationCharges,
      cancellationCharges: value.cancellationCharges,
      amtPayable: value.payableToCustomer,
      customerBankName: value.customerBankName,
      customerAccountNo: value.customerAccountNo,
      ifscCode: value.ifscCode,
    }

    this.cancelForm.patchValue(data);
  }

  uploadImage(data) {
    if (data.fieldName == "passbookCopy") {
      this.cancelForm.controls["passbookId"].patchValue(
        data.uploadData.id
      );
    } else if (data.fieldName == "checkCopy") {
      this.cancelForm.controls["checkCopyId"].patchValue(
        data.uploadData.id
      );
    }
  }

  onSubmit() {
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }
    // console.log(this.cancelForm.value);
    let params = {
      cancellationCharges: this.controls.cancellationCharges.value,
      customerBankName: this.controls.customerBankName.value,
      customerAccountNo: this.controls.customerAccountNo.value,
      ifscCode: this.controls.ifscCode.value,
      passbookId: this.controls.passbookId.value,
      checkCopyId: this.controls.checkCopyId.value,
      nextStatus: this.controls.status.value
    }
    this.orderService.updateCancelOrder(this.orderId, params).subscribe(
      res => {
        this.toastr.successToastr("Order Cancelled Successfully");
      }
    );
  }

}
