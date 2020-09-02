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
  orderFlag = false;

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
      paymentMode: this.paymentForm.controls.paymentMode.value,
     
    }
    if (this.emi) {
      this.shopService.getEmiAmount(params).subscribe(res => {
        this.emiAmount = res.amount;
        if (res.paymentMode == 'paymentGateway') {
        this.razorpayPaymentService.razorpayOptions.key = res.razerPayConfig;
        this.razorpayPaymentService.razorpayOptions.amount = res.razorPayOrder.amount;
        this.razorpayPaymentService.razorpayOptions.order_id = res.razorPayOrder.id;
        this.razorpayPaymentService.razorpayOptions.prefill.contact = this.orderData.customerDetails.mobileNumber;
        this.razorpayPaymentService.razorpayOptions.prefill.email = this.orderData.customerDetails.email || 'info@augmont.in';
        this.razorpayPaymentService.razorpayOptions.handler = this.razorPayResponsehandler.bind(this);
        this.razorpayPaymentService.initPay(this.razorpayPaymentService.razorpayOptions);
        } else {
          const dialogRef = this.dialog.open(PaymentDialogComponent, {
            data: { paymentData: res, 
              isEMI: true,
              orderId: this.orderId,
              paymentMode: this.paymentForm.controls.paymentMode.value

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
      this.shopService.payEMI(payEMIData).subscribe(res => {
        console.log(payEMIData)
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