import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { ShopService } from '../../../../../core/broker';
import { ActivatedRoute, Router } from "@angular/router";
import { EmiDetailsService } from "../../../../../core/emi-management/order-management";
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { RazorpayPaymentService } from '../../../../../core/shared/services/razorpay-payment.service';

@Component({
  selector: 'kt-view-pay',
  templateUrl: './view-pay.component.html',
  styleUrls: ['./view-pay.component.scss']
})
export class ViewPayComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  orderId: any;
  orderData: any;
  emi = [];
  emiAmount = 0;

  constructor(
    private zone: NgZone,
    private shopService: ShopService,
    private route: ActivatedRoute,
    private emiDetailsService: EmiDetailsService,
    private razorpayPaymentService: RazorpayPaymentService
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.getOrderDetails();
  }

  getOrderDetails() {
    this.shopService.getOrderDetails(this.orderId).subscribe(res => this.orderData = res.orderData);
  }

  selectedEmi(event, id, index) {
    if (event.checked) {
      this.emi = [];
      this.orderData.orderemidetails.forEach((emidetail, i) => {
        if (index >= i && (emidetail.orderStatusId == 1 || emidetail.orderStatusId == 15)) {
          emidetail.checked = true;
          this.emi.push(emidetail.id);
        }
      });
    } else {
      if (this.emi.length > 0) {
        this.orderData.orderemidetails.forEach((emidetail, i) => {
          if (index <= i) {
            emidetail.checked = false;
            const emiIndex = this.emi.indexOf(emidetail.id);
            if (emiIndex > -1) {
              this.emi.splice(emiIndex, 1);
            }
          }
        });
      }
    }
    console.log(this.emi)
  }

  getEmiAmount() {
    const params = {
      emiId: this.emi,
    }
    if (this.emi) {
      this.shopService.getEmiAmount(params).subscribe(res => {
        this.emiAmount = res.amount;
        this.razorpayPaymentService.razorpayOptions.key = res.razerPayConfig;
        this.razorpayPaymentService.razorpayOptions.amount = res.razorPayOrder.amount;
        this.razorpayPaymentService.razorpayOptions.order_id = res.razorPayOrder.id;
        this.razorpayPaymentService.razorpayOptions.prefill.contact = this.orderData.customerDetails.mobileNumber;
        this.razorpayPaymentService.razorpayOptions.prefill.email = this.orderData.customerDetails.email || 'info@augmont.in';
        this.razorpayPaymentService.razorpayOptions.handler = this.razorPayResponsehandler.bind(this);
        this.razorpayPaymentService.initPay(this.razorpayPaymentService.razorpayOptions);
      },
        error => {
          this.emi = [];
          this.toastr.errorToastr(error.error.message);
          this.getOrderDetails();
        });
    }
  }

  razorPayResponsehandler(response) {
    this.zone.run(() => {
      const payEMIData = {
        transactionDetails: response,
        transactionAmount: Number(this.emiAmount),
        emiId: this.emi,
      }
      this.shopService.payEMI(payEMIData).subscribe(res => {
        this.toastr.successToastr("EMI Paid Successfully");
        this.emi = [];
        this.getOrderDetails();
      },
        error => {
          this.toastr.errorToastr(error.error);
        });
    });
  }

  printEmiReceipt(id) {
    this.emiDetailsService.emiReceipt(id).subscribe();
  }
}