import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepositListComponent } from './deposit-list/deposit-list.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PartialsModule } from '../../../partials/partials.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { CoreModule } from '../../../../core/core.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../core/_base/crud';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TopUpApprovalComponent } from './top-up-approval/top-up-approval.component';
import { PartReleaseApprovalComponent } from './jewellery-release-approval/part-release-approval/part-release-approval.component';
import { FullReleaseApprovalComponent } from './jewellery-release-approval/full-release-approval/full-release-approval.component';

const routes = [
  {
    path: 'deposit',
    component: DepositListComponent
  },
  {
    path: 'top-up-approval',
    component: TopUpApprovalComponent
  },
  {
    path: 'part-release-approval',
    component: PartReleaseApprovalComponent
  },
  {
    path: 'full-release-approval',
    component: FullReleaseApprovalComponent
  }
]

@NgModule({
  declarations: [DepositListComponent, TopUpApprovalComponent, PartReleaseApprovalComponent, FullReleaseApprovalComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialsModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CoreModule,
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
})
export class FundsApprovalsModule { }
