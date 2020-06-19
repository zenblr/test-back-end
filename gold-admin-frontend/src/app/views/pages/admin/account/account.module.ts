import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanDisbursementListComponent } from './loan-disbursement/loan-disbursement-list/loan-disbursement-list.component';
import { LoanDisbursementAddComponent } from './loan-disbursement/loan-disbursement-add/loan-disbursement-add.component';
import { LoanRepaymentListComponent } from './loan-repayment/loan-repayment-list/loan-repayment-list.component';
import { LoanRepaymentAddComponent } from './loan-repayment/loan-repayment-add/loan-repayment-add.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PartialsModule } from '../../../partials/partials.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { CoreModule } from '../../../../core/core.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../core/_base/crud';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

const routes = [
  { path: 'loan-disbursement', component: LoanDisbursementListComponent },
  { path: 'loan-repayment', component: LoanRepaymentListComponent },
]

@NgModule({
  declarations: [LoanDisbursementListComponent, LoanDisbursementAddComponent, LoanRepaymentListComponent, LoanRepaymentAddComponent],
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
export class AccountModule { }
