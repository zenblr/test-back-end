import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReasonsComponent } from './reasons/reasons.component';
import { PurposesComponent } from './purposes/purposes.component';
import { PacketLocationComponent } from './packet-location/packet-location.component';
import { OrnamentsComponent } from './ornaments/ornaments.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PartialsModule } from '../../partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { CoreModule } from '../../../core/core.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

const routes: Routes = [
  { path: 'reasons', component: ReasonsComponent },
  { path: 'purposes', component: PurposesComponent },
  { path: 'ornamnents', component: OrnamentsComponent },
  { path: 'packet-location', component: PacketLocationComponent },
]

@NgModule({
  declarations: [ReasonsComponent, PurposesComponent, PacketLocationComponent, OrnamentsComponent],
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
export class MastersModule { }
