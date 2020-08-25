// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
// NGRX

// Translate
import { TranslateModule } from "@ngx-translate/core";
import { PartialsModule } from "../../partials/partials.module";
import { NgxPermissionsModule } from 'ngx-permissions';
// Services
import {
  HttpUtilsService,
  TypesUtilsService,
  InterceptService,
  LayoutUtilsService,
} from "../../../core/_base/crud";
// Shared
import {
  ActionNotificationComponent,
  DeleteEntityDialogComponent,
} from "../../partials/content/crud";
// Material
import { AngularMaterialModule } from "../angular-material/angular-material.module";
// Module
import { CoreModule } from "../../../core/core.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {
  MatDialogModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";

//Components

import { BrokerComponent } from "./broker.component";
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers-list/customers.component';
import { OrdersComponent } from './orders/orders-list/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileChangePassComponent } from './profile/profile-change-pass/profile-change-pass.component';
import { ProfileChangePanComponent } from './profile/profile-change-pan/profile-change-pan.component';
import { CheckoutCustomerComponent } from './checkout-customer/checkout-customer.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { ShopComponent } from './shop/shop.component';
import { ProductComponent } from './shop/product/product.component';
import { OrderReceivedComponent } from './order-received/order-received.component';
import { ViewPayComponent } from './orders/view-pay/view-pay.component';
import { CancelOrderComponent } from './orders/cancel-order/cancel-order.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';

const routes: Routes = [
  {
    path: "",

    component: BrokerComponent,

    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "customers",
        component: CustomersComponent,
      },
      {
        path: "orders",
        component: OrdersComponent,
      },
      {
        path: "orders/view-pay/:id",
        component: ViewPayComponent,
      },
      {
        path: "orders/cancel-order/:id",
        component: CancelOrderComponent,
      },
      {
        path: "profile",
        component: ProfileComponent,
      },
      {
        path: "checkout-customer-address",
        component: CheckoutCustomerComponent,
      },
      {
        path: "cart",
        component: ShoppingCartComponent,
      },
      {
        path: "shop",
        component: ShopComponent,
      },
      {
        path: "shop/product/:id",
        component: ProductComponent,
      },
      {
        path: "order-received/:id",
        component: OrderReceivedComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    BrokerComponent,
    DashboardComponent,
    CustomersComponent,
    OrdersComponent,
    ProfileComponent,
    ProfileChangePassComponent,
    ProfileChangePanComponent,
    CheckoutCustomerComponent,
    ShoppingCartComponent,
    ShopComponent,
    ProductComponent,
    OrderReceivedComponent,
    ViewPayComponent,
    CancelOrderComponent,
    PaymentDialogComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialsModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    AngularMaterialModule,
    CoreModule,
    NgbModule,
    MatDialogModule,
  ],
  providers: [
    InterceptService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true,
    },
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService,
  ],
  entryComponents: [
    ProfileChangePassComponent,
    ProfileChangePanComponent,
    PaymentDialogComponent
  ],
})
export class MerchantModule { }
