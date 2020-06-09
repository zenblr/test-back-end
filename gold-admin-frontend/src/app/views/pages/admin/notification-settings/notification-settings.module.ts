import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router'
import { AngularMaterialModule } from '../../angular-material/angular-material.module'
import { PartialsModule } from '../../../partials/partials.module';
import { CoreModule } from '../../../../core/core.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../core/_base/crud';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ActionNotificationComponent, DeleteEntityDialogComponent } from '../../../partials/content/crud';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SmsAlertListComponent } from './sms-alert/sms-alert-list/sms-alert-list.component';
import { SmsAlertAddComponent } from './sms-alert/sms-alert-add/sms-alert-add.component';
import { EmailAlertAddComponent } from './email-alert/email-alert-add/email-alert-add.component';
import { EmailAlertListComponent } from './email-alert/email-alert-list/email-alert-list.component';

import { QuillModule } from 'ngx-quill'

const routes: Routes = [
  { path: 'email-alert', component: EmailAlertListComponent },
  { path: 'sms-alert', component: SmsAlertListComponent },
]

@NgModule({
  declarations: [SmsAlertListComponent, SmsAlertAddComponent, EmailAlertAddComponent, EmailAlertListComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialsModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CoreModule,
    QuillModule.forRoot()
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
    DeleteEntityDialogComponent,
    EmailAlertAddComponent,
    SmsAlertAddComponent
  ],
})
export class NotificationSettingsModule { }
