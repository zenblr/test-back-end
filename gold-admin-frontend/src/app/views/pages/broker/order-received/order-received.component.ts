import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ToastrComponent } from '../../../partials/components/toastr/toastr.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutCustomerService, ShoppingCartService } from '../../../../core/merchant-broker';

@Component({
  selector: 'kt-order-received',
  templateUrl: './order-received.component.html',
  styleUrls: ['./order-received.component.scss']
})
export class OrderReceivedComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;
  orderedData = [];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutCustomerService: CheckoutCustomerService,
    private shoppingCartService: ShoppingCartService
  ) { }

  ngOnInit() {
    this.orderedData = [
      {
        "orderUniqueId": 693602,
        "quantity": 1,
        "numberOfPendingEmi": 3,
        "product": {
          "productName": "Augmont 10GM Raja Rani Embossed Coin",
          "sku": "AU999G010RREC",
          "weight": 10
        },
        "paymentType": {
          "paymentType": "3"
        },
        "customerDetails": {
          "customerUniqueId": "KBBZR957",
          "firstName": "Pratik ",
          "lastName": "Bhayade",
          "mobileNumber": "7276808761",
          "email": "pratik@nimapinfotech.com"
        },
        "orderdetails": [
          {
            "finalOrderPrice": 48826.46,
            "initialPayment": 9765.29,
            "forwordCost": 48826.46
          }
        ]
      },
      {
        "orderUniqueId": 107477,
        "quantity": 1,
        "numberOfPendingEmi": 3,
        "product": {
          "productName": "Augmont 20Gm Silver Coin (999 Purity)",
          "sku": "AU999SC20G",
          "weight": 20
        },
        "paymentType": {
          "paymentType": "3"
        },
        "customerDetails": {
          "customerUniqueId": "KBBZR957",
          "firstName": "Pratik ",
          "lastName": "Bhayade",
          "mobileNumber": "7276808761",
          "email": "pratik@nimapinfotech.com"
        },
        "orderdetails": [
          {
            "finalOrderPrice": 97446.04,
            "initialPayment": 19489.21,
            "forwordCost": 97446.04
          }
        ]
      },
      {
        "orderUniqueId": 185927,
        "quantity": 1,
        "numberOfPendingEmi": 0,
        "product": {
          "productName": "Augmont Classic Om Pendant",
          "sku": "AP916G001CO",
          "weight": 1
        },
        "paymentType": {
          "paymentType": "spot"
        },
        "customerDetails": {
          "customerUniqueId": "KBBZR957",
          "firstName": "Pratik ",
          "lastName": "Bhayade",
          "mobileNumber": "7276808761",
          "email": "pratik@nimapinfotech.com"
        },
        "orderdetails": [
          {
            "finalOrderPrice": 4954.39,
            "initialPayment": null,
            "forwordCost": null
          }
        ]
      }
    ]
  }

  printProforma() {

  }

  printContract() {

  }
}
