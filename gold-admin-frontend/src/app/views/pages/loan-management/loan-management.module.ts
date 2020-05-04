import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanCalculatorComponent } from './loan-calculator/loan-calculator.component';
import { RouterModule, Routes } from '@angular/router';
import { AngularMaterialModule } from '../angular-material/angular-material.module'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PartialsModule } from '../../partials/partials.module'
const rout: Routes = [
  {
    path: 'loan-calculator',
    component: LoanCalculatorComponent
  }
]

@NgModule({
  declarations: [LoanCalculatorComponent],
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
