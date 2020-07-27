import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AngularMaterialModule } from '../../angular-material/angular-material.module'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PartialsModule } from '../../../partials/partials.module';
import { CoreModule } from '../../../../core/core.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DeleteEntityDialogComponent } from '../../../partials/content/crud';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../core/_base/crud';

import { ScrapManagementComponent } from './scrap-management.component';
import { ScrapCalculatorComponent } from './scrap-calculator/scrap-calculator.component';
import { PacketsListComponent } from './packets/packets-list/packets-list.component';
import { AddPacketsComponent } from './packets/add-packets/add-packets.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { WebcamDialogComponent } from '../kyc-settings/webcam-dialog/webcam-dialog.component';
import { UserReviewComponent } from '../kyc-settings/tabs/user-review/user-review.component';

const routes: Routes = [
  {
    path: '',
    component: ScrapManagementComponent,
    children: [
      {
        path: '',
        redirectTo: 'scrap-buying-calculator',
        pathMatch: 'full'
      },
      {
        path: 'scrap-buying-calculator',
        component: ScrapCalculatorComponent
      },
      {
        path: 'packets',
        component: PacketsListComponent
      },
      {
        path: 'global-settings',
        component: GlobalSettingsComponent
      },
    ],
  },
];

@NgModule({
  declarations: [
    ScrapManagementComponent,
    ScrapCalculatorComponent,
    PacketsListComponent,
    AddPacketsComponent,
    GlobalSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    PartialsModule,
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
    DeleteEntityDialogComponent,
    AddPacketsComponent,
    WebcamDialogComponent,
    UserReviewComponent
  ]
})
export class ScrapManagementModule { }
