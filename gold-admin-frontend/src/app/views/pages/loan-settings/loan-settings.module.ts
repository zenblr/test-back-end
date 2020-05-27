import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router'
import { AngularMaterialModule } from '../angular-material/angular-material.module'
import { PartialsModule } from '../../partials/partials.module'
import { LoanStatusComponent } from './loan-status/loan-status.component';
// import { LoanSchemeComponent } from '../../partials/partials.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ActionNotificationComponent, DeleteEntityDialogComponent } from '../../partials/content/crud';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddSchemeComponent } from './add-scheme/add-scheme.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoanSchemeComponent } from './loan-scheme/loan-scheme.component';
import { CoreModule } from '../../../core/core.module';
import { AddKaratDetailsComponent } from './karat-details/add-karat-details/add-karat-details.component';
import { ListKaratDetailsComponent } from './karat-details/list-karat-details/list-karat-details.component'
import { NgxPermissionsModule } from 'ngx-permissions';
const routes: Routes = [
  { path: 'loan-status', component: LoanStatusComponent },
  { path: 'scheme', component: LoanSchemeComponent },
  { path: 'karat-details', component: ListKaratDetailsComponent }
]

@NgModule({
  declarations: [
    LoanStatusComponent,
    AddSchemeComponent,
    AddKaratDetailsComponent,
    ListKaratDetailsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialsModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    AngularMaterialModule,
    CoreModule
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
    AddSchemeComponent,
    AddKaratDetailsComponent,
    DeleteEntityDialogComponent
  ],
})
export class LoanSettingsModule { }
