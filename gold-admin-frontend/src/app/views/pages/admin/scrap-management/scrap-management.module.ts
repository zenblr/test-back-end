import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanCalculatorComponent } from './scrap-calculator/loan-calculator.component';
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

import { RoughLoanAmountComponent } from './scrap-calculator/tabs/rough-loan-amount/rough-loan-amount.component';
import { FinalLoanAmountComponent } from './scrap-calculator/tabs/final-loan-amount/final-loan-amount.component';
import { LoanApplicationFormComponent } from './scrap-application-form/loan-application-form.component';
import { BasicDetailsComponent } from './scrap-application-form/tabs/basic-details/basic-details.component';
import { KycDetailsComponent } from './scrap-application-form/tabs/kyc-details/kyc-details.component';
import { NomineeDetailsComponent } from './scrap-application-form/tabs/nominee-details/nominee-details.component'
// import { OrnamentsComponent } from './scrap-application-form/tabs/ornaments/ornaments.component';
import { FinalInterestAmountComponent } from './scrap-calculator/tabs/final-interest-amount/final-interest-amount.component'
import { BankDetailsComponent } from './scrap-application-form/tabs/bank-details/bank-details.component';
import { ApprovalComponent } from './scrap-application-form/tabs/approval/approval.component';
import { UploadPacketsComponent } from './packets/upload-packets/upload-packets.component';
import { PacketsListComponent } from './packets/packets-list/packets-list.component';
import { AssignPacketsComponent } from './packets/assign-packets/assign-packets.component';
import { InterestCalculatorComponent } from './scrap-application-form/tabs/interest-calculator/interest-calculator.component';
import { UnSecuredSchemeComponent } from './scrap-application-form/un-secured-scheme/un-secured-scheme.component';
import { WebcamDialogComponent } from '../kyc-settings/webcam-dialog/webcam-dialog.component';
import { PacketTrackingComponent } from './packets/packet-tracking/packet-tracking.component';
import { UpdateLocationComponent } from './packets/update-location/update-location.component';
import { UserReviewComponent } from '../kyc-settings/tabs/user-review/user-review.component';
import { UploadLoanDocumentsComponent } from './scrap-application-form/tabs/upload-loan-documents/upload-loan-documents.component';

// import { LoanDetailsComponent } from './scrap-details/loan-details.component';
// import { DisburseDialogComponent } from './disburse-dialog/disburse-dialog.component';
// import { AppliedLoanComponent } from './applied-scrap/applied-loan.component';
// import { TopUpComponent } from './top-up/top-up.component';
// import { LoanTransferComponent } from './scrap-transfer/loan-transfer.component';
// import { LoanTransferListComponent } from './scrap-transfer-list/loan-transfer-list.component';

const rout: Routes = [
  {
    path: 'scrap-calculator',
    component: LoanCalculatorComponent
  },
  {
    path: 'scrap-application-form',
    component: LoanApplicationFormComponent
  },
  {
    path: 'scrap-application-form/:id',
    component: LoanApplicationFormComponent
  },
  {
    path: 'packet',
    component: PacketsListComponent
  },
  {
    path: 'packet-image-upload/:id',
    component: LoanApplicationFormComponent
  },
  {
    path: 'packet-tracking',
    component: PacketTrackingComponent
  },
  {
    path: 'view-loan/:id',
    component: LoanApplicationFormComponent
  },
]

@NgModule({
  declarations: [
    LoanCalculatorComponent,
    RoughLoanAmountComponent,
    FinalLoanAmountComponent,
    LoanApplicationFormComponent,
    BasicDetailsComponent,
    KycDetailsComponent,
    NomineeDetailsComponent,
    FinalInterestAmountComponent,
    BankDetailsComponent,
    ApprovalComponent,
    UploadPacketsComponent,
    PacketsListComponent,
    AssignPacketsComponent,
    InterestCalculatorComponent,
    UnSecuredSchemeComponent,
    PacketTrackingComponent,
    UpdateLocationComponent,
    UploadLoanDocumentsComponent,
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
    AssignPacketsComponent,
    DeleteEntityDialogComponent,
    UnSecuredSchemeComponent,
    WebcamDialogComponent,
    UpdateLocationComponent,
    // OrnamentsComponent,
    UserReviewComponent
  ]
})
export class ScrapManagementModule { }
