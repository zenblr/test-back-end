import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Modules
import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../../partials/partials.module';
// Components
import { LeadManagementComponent } from './lead-management.component';
import { AddLeadComponent } from './add-lead/add-lead.component';
// Material
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { HttpUtilsService, TypesUtilsService, LayoutUtilsService, InterceptService } from '../../../../core/_base/crud';
import { MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MAT_SNACK_BAR_DATA, MatDialogRef } from '@angular/material';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewRequestAddComponent } from './new-request-add/new-request-add.component';
import { NewRequestListComponent } from './new-request-list/new-request-list.component';
import { MyRequestComponent } from './my-request/my-request.component';
import { NewRequestAssignAppraiserComponent } from './new-request-assign-appraiser/new-request-assign-appraiser.component';
import { RegisteredCustomerRequestComponent } from './registered-customer-request/registered-customer-request.component';

const routes: Routes = [
  { path: '', component: LeadManagementComponent },
  { path: 'new-requests', component: NewRequestListComponent },
  { path: 'my-requests', component: MyRequestComponent },
  { path: 'registered-customers', component: RegisteredCustomerRequestComponent }
]

@NgModule({
  declarations: [
    LeadManagementComponent,
    AddLeadComponent, NewRequestAddComponent, NewRequestListComponent, MyRequestComponent, NewRequestAssignAppraiserComponent, RegisteredCustomerRequestComponent
  ],
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
  entryComponents: [
    AddLeadComponent,
    NewRequestAddComponent,
    NewRequestAssignAppraiserComponent
  ]
})
export class LeadManagementModule { }
