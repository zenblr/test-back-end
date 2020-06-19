import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { ShopService } from '../../../../../core/merchant-broker';
import { ActivatedRoute, Router } from "@angular/router";
import { EmiDetailsService } from "../../../../../core/emi-management/order-management";
import { ToastrComponent } from '../../../../partials/components/toastr/toastr.component';
import { WindowRefService, ICustomWindow } from '../../../../../core/shared/services/window-ref.service';

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
  rzp: any;
  private _window: ICustomWindow;
  razorpayOptions: any = {
    key: '',
    amount: '',
    currency: 'INR',
    name: 'Augmont',
    description: '',
    image: 'https://gold.nimapinfotech.com/assets/media/logos/logo.png',
    order_id: '',
    handler: this.razorPayResponsehandler.bind(this),
    modal: {
      ondismiss: (() => {
        this.zone.run(() => {

        });
      })
    },
    prefill: {},
    notes: {
      address: ''
    },
    theme: {
      color: '#454d67'
    },
  };

  constructor(
    private zone: NgZone,
    private winRef: WindowRefService,
    private shopService: ShopService,
    private route: ActivatedRoute,
    private emiDetailsService: EmiDetailsService,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.params.id;
    this.getOrderDetails();
  }

  getOrderDetails() {
    this.shopService.getOrderDetails(this.orderId).subscribe(res => this.orderData = res.orderData);
  }

  selectedEmi(event, id) {
    if (event.checked) {
      this.emi.push(id);
    } else {
      if (this.emi.length > 0) {
        const index = this.emi.indexOf(id);
        if (index > -1) {
          this.emi.splice(index, 1);
        }
      }
    }
  }

  getEmiAmount() {
    const params = {
      emiId: this.emi,
    }
    if (this.emi) {
      this.shopService.getEmiAmount(params).subscribe(res => {
        this.emiAmount = res.amount;
        this.razorpayOptions.key = res.razerPayConfig;
        this.razorpayOptions.amount = res.razorPayOrder.amount;
        this.razorpayOptions.order_id = res.razorPayOrder.id;

        this.initPay(this.razorpayOptions);
      },
        error => {
          this.toastr.errorToastr(error.message);
          this.getOrderDetails();
        });
    }
  }

  initPay(options) {
    this.rzp = new this.winRef.nativeWindow['Razorpay'](options);
    this.rzp.open();
  }

  razorPayResponsehandler(response: any) {
    console.log(response)
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
        })
    });
  }

  printEmiReceipt(id) {
    this.emiDetailsService.emiReceipt(id).subscribe();
  }
}
