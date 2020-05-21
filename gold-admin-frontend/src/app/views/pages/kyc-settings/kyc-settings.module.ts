import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

// component
import { KycSettingsComponent } from './kyc-settings.component'

// Module
import { PartialsModule } from '../../partials/partials.module';
import { CoreModule } from '../../../core/core.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserDetailsComponent } from './tabs/user-details/user-details.component';
import { UserAddressComponent } from './tabs/user-address/user-address.component';
import { UserPersonalComponent } from './tabs/user-personal/user-personal.component';
import { UserBanksComponent } from './tabs/user-banks/user-banks.component';
import { UserReviewComponent } from './tabs/user-review/user-review.component';


const rout: Routes = [
  {
    path: '',
    component: KycSettingsComponent
  }
]

@NgModule({
  declarations: [
    KycSettingsComponent,
    UserDetailsComponent,
    UserAddressComponent,
    UserPersonalComponent,
    UserBanksComponent,
  ],
  imports: [
    CommonModule,
    PartialsModule,
    CoreModule,
    AngularMaterialModule,
    RouterModule.forChild(rout),
    NgbModule,
    ReactiveFormsModule,
    FormsModule
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
})
export class KycSettingsModule { }
