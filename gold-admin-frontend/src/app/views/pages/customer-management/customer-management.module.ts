import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Modules
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
// Components
import { CustomerManagementComponent } from './customer-management.component';
import { AddLeadComponent } from './add-lead/add-lead.component';
// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { HttpUtilsService, TypesUtilsService, LayoutUtilsService, InterceptService } from '../../../core/_base/crud';
import { MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MAT_SNACK_BAR_DATA } from '@angular/material';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

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
  declarations: [CustomerManagementComponent, AddLeadComponent],
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
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService
  ],
  entryComponents: [
    AddLeadComponent
  ]
})
export class CustomerManagementModule { }
