import { Injectable, NgZone } from '@angular/core';
import { WindowRefService, ICustomWindow } from './window-ref.service';

@Injectable({
  providedIn: 'root'
})
export class RazorpayPaymentService {
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
    handler: '',
    modal: {
      ondismiss: (() => {
        this.zone.run(() => { });
      })
    },
    prefill: {
      contact: '',
      email: '',
    },
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
  ) {
    this._window = this.winRef.nativeWindow;
  }

  initPay(options) {
    this.rzp = new this.winRef.nativeWindow['Razorpay'](options);
    this.rzp.open();
  }

}
