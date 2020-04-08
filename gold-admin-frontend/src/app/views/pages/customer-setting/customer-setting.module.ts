import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Modules
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
// Components
import { CustomerListComponent } from './customer-list/customer-list.component';
// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { HttpUtilsService, TypesUtilsService, LayoutUtilsService, InterceptService } from '../../../core/_base/crud';
import { MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MAT_SNACK_BAR_DATA } from '@angular/material';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CustomerSettingComponent } from './customer-setting.component';
import { CustomerGridComponent } from './customer-grid/customer-grid.component';

const routes: Routes = [
  {
    path: 'customer-list',
    component: CustomerSettingComponent
  }
];

@NgModule({
  declarations: [CustomerListComponent,
    CustomerSettingComponent,
    CustomerGridComponent],
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
  entryComponents: []
})
export class CustomerSettingModule { }
