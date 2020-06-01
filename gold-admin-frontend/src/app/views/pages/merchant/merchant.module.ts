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

import { MerchantComponent } from "./merchant.component";
import { CustomersComponent } from './customers/customers-list/customers.component';
import { OrdersComponent } from './orders/orders-list/orders.component';

const routes: Routes = [
  {
    path: "",

    component: MerchantComponent,

    children: [
      { path: "", redirectTo: "customers", pathMatch: "full" },
      {
        path: "customers",
        component: CustomersComponent,
      },
      {
        path: "orders",
        component: OrdersComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [MerchantComponent, CustomersComponent, OrdersComponent],
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
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        panelClass: "kt-mat-dialog-container__wrapper",
        height: "auto",
        width: "600px",
      },
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },

    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService,
  ],
})
export class MerchantModule { }
