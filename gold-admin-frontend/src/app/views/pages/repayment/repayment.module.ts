import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyPaymentComponent } from './monthly-payment/monthly-payment.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { InterceptService } from '../../../core/_base/crud/utils/intercept.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { MonthlyPaymentAddComponent } from './monthly-payment-add/monthly-payment-add.component';

const routes: Routes = [
  {
    path: 'monthly',
    component: MonthlyPaymentComponent,
  }
]

@NgModule({
  declarations: [MonthlyPaymentComponent, MonthlyPaymentAddComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CoreModule,
    PartialsModule,
    AngularMaterialModule
  ],
  providers: [
    InterceptService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        panelClass: 'kt-mat-dialog-container__wrapper',
        height: 'auto',
        width: '600px'
      }
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService
  ],
  entryComponents: [MonthlyPaymentAddComponent]
})
export class RepaymentModule { }