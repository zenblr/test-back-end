import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtpComponent } from './otp.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {

    path: '',
    component: OtpComponent

  },
]


@NgModule({
  declarations: [OtpComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

  ]
})
export class OtpModule { }
