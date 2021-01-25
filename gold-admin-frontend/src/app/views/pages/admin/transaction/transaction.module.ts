import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction.component';
import { RouterModule, Route } from '@angular/router';
import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../../partials/partials.module';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { HttpUtilsService, TypesUtilsService, LayoutUtilsService, InterceptService } from '../../../../core/_base/crud';
import { MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MAT_SNACK_BAR_DATA, MatDialogRef } from '@angular/material';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

const routes = [
  { path: '', component: TransactionComponent, },
  { path: '/:id', component: TransactionComponent, }
]

@NgModule({
  declarations: [TransactionComponent],
  imports: [
    CommonModule,
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
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService
  ],
})
export class TransactionModule { }
