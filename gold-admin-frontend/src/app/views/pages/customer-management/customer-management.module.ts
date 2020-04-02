import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
// Modules
// Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
// Components
import { CustomerManagementComponent } from './customer-management.component';

// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';

const routes: Routes = [
  {
    path: '',
    component: CustomerManagementComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'upload-banner',
      //   pathMatch: 'full'
      // },
    ]
  }
]

@NgModule({
  declarations: [CustomerManagementComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreModule,
    PartialsModule,
    AngularMaterialModule
  ]
})
export class CustomerManagementModule { }
