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
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomersComponent } from './customers/customers-list/customers.component';
import { OrdersComponent } from './orders/orders-list/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileChangePassComponent } from './profile/profile-change-pass/profile-change-pass.component';
import { ProfileChangePanComponent } from './profile/profile-change-pan/profile-change-pan.component';

const routes: Routes = [
  {
    path: "",

    component: MerchantComponent,

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
        path: "profile",
        component: ProfileComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    MerchantComponent,
    DashboardComponent,
    CustomersComponent,
    OrdersComponent,
    ProfileComponent,
    ProfileChangePassComponent,
    ProfileChangePanComponent
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
  entryComponents: [
    ProfileChangePassComponent,
    ProfileChangePanComponent,
  ],
})
export class MerchantModule { }
