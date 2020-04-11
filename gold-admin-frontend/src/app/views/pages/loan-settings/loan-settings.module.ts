import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router'
import { AngularMaterialModule } from '../angular-material/angular-material.module'
import { PartialsModule } from '../../partials/partials.module'
import { LoanStatusComponent } from './loan-status/loan-status.component';
import { LoanSchemeComponent } from './loan-scheme/loan-scheme.component';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ActionNotificationComponent } from '../../partials/content/crud';
import { StoreModule } from '@ngrx/store';
import { usersReducer, UserEffects } from '../../../core/auth';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddSchemeComponent } from './add-scheme/add-scheme.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

const routes: Routes = [
  { path: 'loan-status', component: LoanStatusComponent },
  { path: 'scheme', component: LoanSchemeComponent },
]

@NgModule({
  declarations: [
    LoanStatusComponent,
    LoanSchemeComponent, AddSchemeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialsModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('users', usersReducer),
    EffectsModule.forFeature([UserEffects]),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    AngularMaterialModule
  ],
  providers: [
    InterceptService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService
  ],
  entryComponents: [
    ActionNotificationComponent,
    AddSchemeComponent
  ],
})
export class LoanSettingsModule { }
