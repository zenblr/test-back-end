import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurposesListComponent } from './purposes/purpose-list/purposes-list.component';
import { PacketLocationListComponent } from './packet-location/packet-location-list/packet-location-list.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PartialsModule } from '../../../partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { CoreModule } from '../../../../core/core.module';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../core/_base/crud';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AddPacketLocationComponent } from './packet-location/add-packet-location/add-packet-location.component';
import { OrnamentsAddComponent } from './ornaments/ornaments-add/ornaments-add.component';
import { OrnamentsListComponent } from './ornaments/ornaments-list/ornaments-list.component';
import { AddPurposeComponent } from './purposes/add-purpose/add-purpose.component';
import { ReasonListComponent } from './reasons/reason-list/reason-list.component';
import { ReasonAddComponent } from './reasons/reason-add/reason-add.component';
import { LeadSourceListComponent } from './lead-source/lead-source-list/lead-source-list.component';
import { LeadSourceAddComponent } from './lead-source/lead-source-add/lead-source-add.component';
import { OccupationAddComponent } from './occupation/occupation-add/occupation-add.component';
import { OccupationListComponent } from './occupation/occupation-list/occupation-list.component';
import { OtherChargesAddComponent } from './other-charges/other-charges-add/other-charges-add.component';
import { OtherChargesListComponent } from './other-charges/other-charges-list/other-charges-list.component';

const routes: Routes = [
  {
    path: 'lead-source',
    component: LeadSourceListComponent
  },
  {
    path: 'reasons',
    component: ReasonListComponent
  },
  {
    path: 'purposes',
    component: PurposesListComponent
  },
  {
    path: 'ornaments',
    component: OrnamentsListComponent
  },
  {
    path: 'packet-location',
    component: PacketLocationListComponent
  },
  {
    path: 'occupation',
    component: OccupationListComponent
  },
  {
    path: 'other-charges',
    component: OtherChargesListComponent
  }
]

@NgModule({
  declarations: [
    PurposesListComponent,
    PacketLocationListComponent,
    AddPacketLocationComponent,
    OrnamentsAddComponent,
    OrnamentsListComponent,
    AddPurposeComponent,
    ReasonListComponent,
    ReasonAddComponent,
    LeadSourceListComponent,
    LeadSourceAddComponent,
    OccupationAddComponent,
    OccupationListComponent,
    OtherChargesListComponent,
    OtherChargesAddComponent,
  ],
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
  entryComponents: [
    AddPacketLocationComponent,
    OrnamentsAddComponent,
    AddPurposeComponent,
    ReasonAddComponent,
    LeadSourceAddComponent,
    OccupationAddComponent,
    OtherChargesAddComponent,
  ]
})
export class MastersModule { }
