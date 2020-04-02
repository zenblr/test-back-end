import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router'
import { LoanStatusComponent } from './loan-status/loan-status.component';
import { LoanSchemeComponent } from './loan-scheme/loan-scheme.component';

const routes: Routes = [
  { path: 'loan-status', component: LoanStatusComponent },
  { path: 'scheme', component: LoanSchemeComponent },
]

@NgModule({
  declarations: [
    LoanStatusComponent, 
    LoanSchemeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LoanSettingsModule { }
