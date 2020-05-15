import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { Routes, RouterModule } from "@angular/router";
import { PartialsModule } from '../../partials/partials.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { ActionNotificationComponent } from '../../partials/content/crud';

const routes: Routes = [
  { path: 'change-password', component: ChangePasswordComponent }
]

@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialsModule,
    RouterModule.forChild(routes),
   
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
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService
  ],
  entryComponents: [
    ActionNotificationComponent,
  ],
})
export class AdminAccountModule { }
