import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AngularMaterialModule } from '../../angular-material/angular-material.module'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PartialsModule } from '../../../partials/partials.module';
import { CoreModule } from '../../../../core/core.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DeleteEntityDialogComponent } from '../../../partials/content/crud';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../core/_base/crud';

import { ScrapManagementComponent } from './scrap-management.component';
import { ScrapCalculatorComponent } from './scrap-calculator/scrap-calculator.component';
import { ScrapApplicationFormComponent } from './scrap-application-form/scrap-application-form.component';
import { PacketsListComponent } from './packets/packets-list/packets-list.component';
import { AddPacketsComponent } from './packets/add-packets/add-packets.component';
import { AssignAppraiserPacketsComponent } from './packets/assign-appraiser-packets/assign-appraiser-packets.component';
import { AppliedScrapComponent } from './applied-scrap/applied-scrap.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { WebcamDialogComponent } from '../kyc-settings/webcam-dialog/webcam-dialog.component';
import { UserReviewComponent } from '../kyc-settings/tabs/user-review/user-review.component';
import { BuyingListComponent } from './buying-list/buying-list.component';
import { QuickPayComponent } from './quick-pay/quick-pay.component';
import { CustomerManagementComponent } from './customer-management/customer-management.component';
import { CustomerListComponent } from './customer-management/customer-list/customer-list.component';
import { CustomerGridComponent } from './customer-management/customer-grid/customer-grid.component';
import { CustomerDetailsComponent } from '../../../partials/components/customer-details/customer-details.component';
import { LoanScrapDetailsComponent } from '../../../partials/components/loan-scrap-details/loan-scrap-details.component';
import { StandardDeductionListComponent } from './standard-deduction/standard-deduction-list/standard-deduction-list.component';
import { AddStandardDeductionComponent } from './standard-deduction/add-standard-deduction/add-standard-deduction.component';
import { PacketTrackingComponent } from './packets/packet-tracking/packet-tracking.component';
import { ViewPacketLogComponent } from './packets/view-packet-log/view-packet-log.component';
import { ScrapUpdateLocationComponent } from '../../../partials/components/scrap-update-location/scrap-update-location.component';

const routes: Routes = [
  {
    path: '',
    component: ScrapManagementComponent,
    children: [
      {
        path: '',
        redirectTo: 'applied-scrap',
        pathMatch: 'full'
      },
      {
        path: 'scrap-buying-calculator',
        component: ScrapCalculatorComponent
      },
      {
        path: 'scrap-buying-application-form',
        component: ScrapApplicationFormComponent
      },
      {
        path: 'scrap-buying-application-form/:id',
        component: ScrapApplicationFormComponent
      },
      {
        path: 'packet-image-upload/:id',
        component: ScrapApplicationFormComponent
      },
      {
        path: 'view-scrap/:id',
        component: ScrapApplicationFormComponent
      },
      {
        path: 'packets',
        component: PacketsListComponent
      },
      {
        path: 'packet-tracking',
        component: PacketTrackingComponent
      },
      {
        path: 'applied-scrap',
        component: AppliedScrapComponent
      },
      {
        path: 'scrap-buying',
        component: BuyingListComponent
      },
      {
        path: 'customer-list',
        component: CustomerManagementComponent
      },
      {
        path: 'customer-list/:id',
        component: CustomerDetailsComponent
      },
      {
        path: 'scrap-details/:scrapId',
        component: LoanScrapDetailsComponent
      },
      {
        path: 'standard-deduction',
        component: StandardDeductionListComponent
      },
      {
        path: 'global-settings',
        component: GlobalSettingsComponent
      },
    ],
  },

]

@NgModule({
  declarations: [
    ScrapManagementComponent,
    ScrapCalculatorComponent,
    ScrapApplicationFormComponent,
    PacketsListComponent,
    AddPacketsComponent,
    AssignAppraiserPacketsComponent,
    AppliedScrapComponent,
    GlobalSettingsComponent,
    BuyingListComponent,
    CustomerManagementComponent,
    CustomerListComponent,
    CustomerGridComponent,
    QuickPayComponent,
    StandardDeductionListComponent,
    AddStandardDeductionComponent,
    PacketTrackingComponent,
    ViewPacketLogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    PartialsModule,
    CoreModule
  ],
  providers: [
    InterceptService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService
  ],
  entryComponents: [
    DeleteEntityDialogComponent,
    AddPacketsComponent,
    AssignAppraiserPacketsComponent,
    WebcamDialogComponent,
    UserReviewComponent,
    QuickPayComponent,
    AddStandardDeductionComponent,
    ScrapUpdateLocationComponent,
    PacketTrackingComponent,
    ViewPacketLogComponent,
  ]
})
export class ScrapManagementModule { }
