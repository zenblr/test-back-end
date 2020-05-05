import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanCalculatorComponent } from './loan-calculator/loan-calculator.component';
import { RouterModule, Routes } from '@angular/router';
import { AngularMaterialModule } from '../angular-material/angular-material.module'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PartialsModule } from '../../partials/partials.module';
import { RoughLoanAmountComponent } from './loan-calculator/tabs/rough-loan-amount/rough-loan-amount.component';
import { FinalLoanAmountComponent } from './loan-calculator/tabs/final-loan-amount/final-loan-amount.component';
import { LoanApplicationFormComponent } from './loan-application-form/loan-application-form.component';
import { BasicDetailsComponent } from './loan-application-form/tabs/basic-details/basic-details.component';
import { KycDetailsComponent } from './loan-application-form/tabs/kyc-details/kyc-details.component';
import { NomineeDetailsComponent } from './loan-application-form/tabs/nominee-details/nominee-details.component'
const rout: Routes = [
  {
    path: 'loan-calculator',
    component: LoanCalculatorComponent
  },
  {
    path: 'loan-application-form',
    component: LoanApplicationFormComponent
  }
]

@NgModule({
  declarations: [LoanCalculatorComponent, RoughLoanAmountComponent, FinalLoanAmountComponent, LoanApplicationFormComponent, BasicDetailsComponent, KycDetailsComponent, NomineeDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(rout),
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    PartialsModule
  ]
})
export class LoanManagementModule { }
