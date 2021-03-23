import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { ShopService } from '../../../../../core/broker';
import { ActivatedRoute, Router } from "@angular/router";
import { EmiDetailsService } from "../../../../../core/emi-management/order-management";
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { RazorpayPaymentService } from '../../../../../core/shared/services/razorpay-payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentDialogComponent } from '../../payment-dialog/payment-dialog.component';
import { MatCheckbox, MatDialog } from '@angular/material';
import { CheckoutCustomerService, ShoppingCartService } from '../../../../../core/broker';

@Component({
  selector: 'kt-view-pay',
  templateUrl: './view-pay.component.html',
  styleUrls: ['./view-pay.component.scss']
})
export class ViewPayComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  paymentForm: FormGroup;
  orderId: any;
  blockId: any;
  orderData: any;
  emi = [];
  emiAmount = 0;
  emiValue = 0;
  orderFlag = false;
  depositAmount: any;
  paidFromWallet: any;
  walletMode = false;
  onlineOfflineMode = false;
  onlineMode = false;

  constructor(
    private zone: NgZone,
    private shopService: ShopService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private emiDetailsService: EmiDetailsService,
    private router: Router,
    private checkoutCustomerService: CheckoutCustomerService,
    private shoppingCartService: ShoppingCartService,
    private razorpayPaymentService: RazorpayPaymentService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.getOrderDetails();
    this.initForm()
  }

  initForm() {
    this.paymentForm = this.fb.group({
      paymentMode: ['', [Validators.required]],
    });
    this.paymentForm.valueChanges.subscribe(val => console.log(val))
  }

  get controls() {
    return this.paymentForm.controls;
  }

  getOrderDetails() {
    this.shopService.getOrderDetails(this.orderId).subscribe(res => this.orderData = res.orderData);
  }

  selectedEmi(event, id, index) {
    if (event.checked) {
      this.emi = [];
      this.emiValue = 0;
      this.orderData.orderemidetails.forEach((emidetail, i) => {
        if (index >= i && (emidetail.orderStatusId == 1 || emidetail.orderStatusId == 15)) {
          emidetail.checked = true;
          this.emi.push(emidetail.id);
          this.emiValue += emidetail.emiAmount;
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
              this.emiValue -= emidetail.emiAmount--;
            }
          }
        });
      }
    }
    console.log(this.emi)
    console.log(this.emiValue)
    if (this.orderData.customerDetails.currentWalletBalance) {
      if (Number(this.orderData.customerDetails.currentWalletBalance) < Number(this.emiValue)) {
        this.depositAmount = (Number(this.emiValue) - Number(this.orderData.customerDetails.currentWalletBalance)).toFixed(2);
        this.paidFromWallet = (Number(this.emiValue) - Number(this.depositAmount)).toFixed(2);
        this.walletMode = false;
        this.onlineMode = true;
      } else {
        this.depositAmount = (Number(0));
        this.paidFromWallet = (Number(this.emiValue) - Number(this.depositAmount)).toFixed(2);
        this.onlineMode = false;
        this.walletMode = true;
        this.paymentForm.controls.paymentMode.setValidators([]),
          this.paymentForm.controls.paymentMode.updateValueAndValidity()
      }
    } else {
      this.onlineOfflineMode = true;
    }
  }

  getEmiAmount() {
    let params = {
      emiId: this.emi,
      paymentMode: this.paymentForm.controls.paymentMode.value,
      orderId: this.orderId,
      // transactionAmount: this.depositAmount,
      depositDate: new Date()
    }

    if (this.walletMode) {
      params.paymentMode = 'augmontWallet';
    } else {

    }

    if (this.emi) {
      this.shopService.getEmiAmount(params).subscribe(res => {
        this.emiAmount = res.amount;
        if (this.walletMode) {
          const payEMIData = {
            transactionAmount: Number(this.emiAmount),
            emiId: this.emi,
            orderId: this.orderId,
            paymentMode: params.paymentMode,
            transactionId: res.transactionUniqueId
          }
          this.payEMI(payEMIData);
        } else {
          if (res.paymentMode == 'paymentGateway') {
            this.razorpayPaymentService.razorpayOptions.key = res.razerPayConfig;
            this.razorpayPaymentService.razorpayOptions.amount = res.razorPayOrder.amount;
            this.razorpayPaymentService.razorpayOptions.order_id = res.razorPayOrder.id;
            this.razorpayPaymentService.razorpayOptions.description = "EMI order payment";
            this.razorpayPaymentService.razorpayOptions.prefill.contact = this.orderData.customerDetails.mobileNumber;
            this.razorpayPaymentService.razorpayOptions.prefill.email = this.orderData.customerDetails.email || 'info@augmont.in';
            this.razorpayPaymentService.razorpayOptions.handler = this.razorPayResponsehandler.bind(this);
            this.razorpayPaymentService.initPay(this.razorpayPaymentService.razorpayOptions);
          } else {
            const dialogRef = this.dialog.open(PaymentDialogComponent, {
              data: {
                paymentData: res,
                isEMI: true,
                orderId: this.orderId,
                paymentMode: this.paymentForm.controls.paymentMode.value,
                createdAt: this.orderData.createdAt,
                emiId: this.emi,
              },
              width: '70vw'
            });
            dialogRef.afterClosed().subscribe(res => {
              if (res) {
                console.log(res)
                const msg = 'EMI Paid Successfully';
                this.toastr.successToastr(msg);
                this.router.navigate(['/broker/orders/']);
              }
            });
          }
        }
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
        orderId: this.orderId,
        paymentMode: this.paymentForm.controls.paymentMode.value
      }
      this.payEMI(payEMIData);
    });
  }

  payEMI(data) {
    this.shopService.payEMI(data).subscribe(res => {
      console.log(data)
      this.toastr.successToastr("EMI Paid Successfully");
      this.emi = [];
      this.getOrderDetails();
      this.router.navigate(['/broker/orders/']);
    },
      error => {
        this.toastr.errorToastr(error.error);
      });
  }

  printEmiReceipt(id) {
    this.emiDetailsService.emiReceipt(id).subscribe();
  }

}