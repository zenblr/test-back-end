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

import { ScrapCalculatorComponent } from './scrap-calculator/scrap-calculator.component';
import { ScrapApplicationFormComponent } from './scrap-application-form/scrap-application-form.component';
// import { NomineeDetailsComponent } from '../loan-management/loan-application-form/tabs/nominee-details/nominee-details.component';
// import { InterestCalculatorComponent } from '../loan-management/loan-application-form/tabs/interest-calculator/interest-calculator.component';
// import { BankDetailsComponent } from '../loan-management/loan-application-form/tabs/bank-details/bank-details.component';
// import { ApprovalComponent } from '../loan-management/loan-application-form/tabs/approval/approval.component';
// import { UploadPacketsComponent } from '../loan-management/packets/upload-packets/upload-packets.component';
// import { UploadLoanDocumentsComponent } from '../loan-management/loan-application-form/tabs/upload-loan-documents/upload-loan-documents.component';
// import { WebcamDialogComponent } from '../kyc-settings/webcam-dialog/webcam-dialog.component';
import { UserReviewComponent } from '../kyc-settings/tabs/user-review/user-review.component';

const rout: Routes = [
  {
    path: 'scrap-calculator',
    component: ScrapCalculatorComponent
  },
  {
    path: 'scrap-buying-application-form',
    component: ScrapApplicationFormComponent
  },
]

@NgModule({
  declarations: [
    ScrapCalculatorComponent,
    ScrapApplicationFormComponent,
    // NomineeDetailsComponent,
    // InterestCalculatorComponent,
    // BankDetailsComponent,
    // ApprovalComponent,
    // UploadPacketsComponent,
    // UploadLoanDocumentsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(rout),
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
    // WebcamDialogComponent,
    UserReviewComponent
  ]
})
export class ScrapManagementModule { }
