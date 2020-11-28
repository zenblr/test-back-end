import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AngularMaterialModule } from '../../../angular-material/angular-material.module'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PartialsModule } from '../../../../partials/partials.module';
import { CoreModule } from '../../../../../core/core.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DeleteEntityDialogComponent } from '../../../../partials/content/crud';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SipInvestmentTenureListComponent } from './sip-investment-tenure/sip-investment-tenure-list/sip-investment-tenure-list.component';
import { SipInvestmentTenureAddComponent } from './sip-investment-tenure/sip-investment-tenure-add/sip-investment-tenure-add.component';
import { SipCycleDateListComponent } from './sip-cycle-date/sip-cycle-date-list/sip-cycle-date-list.component';
import { SipCycleDateAddComponent } from './sip-cycle-date/sip-cycle-date-add/sip-cycle-date-add.component';
import { SipManagementComponent } from './sip-management.component';
import { CreateSipComponent } from './create-sip/create-sip.component';
import { SipTradesComponent } from './sip-trades/sip-trades.component';
import { SipApplicationComponent } from './sip-application/sip-application.component';




const routes: Routes = [
      {
        path: '',
        redirectTo: 'sip-cycle-date',
        pathMatch: 'full'
      },
      {
        path: 'sip-cycle-date',
        component: SipCycleDateListComponent
      },
      {
        path: 'sip-trades',
        component: SipTradesComponent
      },
      {
        path: 'sip-application',
        component: SipApplicationComponent
      },
      {
        path: 'create-sip',
        component: CreateSipComponent
      },
      {
        path: 'sip-investment-tenure',
        component: SipInvestmentTenureListComponent
      },
]

@NgModule({
  declarations: [
	SipManagementComponent,
	SipCycleDateAddComponent,
	SipCycleDateListComponent,
	SipInvestmentTenureAddComponent,
	SipInvestmentTenureListComponent,
	CreateSipComponent,
	SipTradesComponent,
  SipApplicationComponent,
 
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
    SipInvestmentTenureAddComponent,
    SipCycleDateAddComponent,
  ]

})
export class SipManagementModule { }

