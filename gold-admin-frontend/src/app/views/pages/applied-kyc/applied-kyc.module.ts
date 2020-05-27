import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppliedKycComponent } from './applied-kyc.component';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

// Module
import { PartialsModule } from '../../partials/partials.module';
import { CoreModule } from '../../../core/core.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UserReviewComponent } from '../kyc-settings/tabs/user-review/user-review.component';
import { NgxPermissionsModule } from 'ngx-permissions';

const rout: Routes = [
  {
    path: '',
    component: AppliedKycComponent
  }
]

@NgModule({
  declarations: [AppliedKycComponent],
  imports: [
    CommonModule,
    PartialsModule,
    CoreModule,
    AngularMaterialModule,
    RouterModule.forChild(rout),
    ReactiveFormsModule,
    FormsModule,
    NgxPermissionsModule.forChild()
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
  entryComponents: [UserReviewComponent]
})
export class AppliedKycModule { }
