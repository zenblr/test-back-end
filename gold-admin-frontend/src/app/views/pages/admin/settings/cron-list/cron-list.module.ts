import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CronListComponent } from './cron-list.component'
import { Routes, RouterModule } from '@angular/router';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CoreModule } from '../../../../../core/core.module';
import { AngularMaterialModule } from '../../../angular-material/angular-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PartialsModule } from '../../../../partials/partials.module';

const routes: Routes = [
  { path: '',redirectTo: 'cron'  },
  { path: 'cron',component: CronListComponent }
]

@NgModule({
  declarations: [CronListComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialsModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CoreModule,
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
})
export class CronListModule { }
