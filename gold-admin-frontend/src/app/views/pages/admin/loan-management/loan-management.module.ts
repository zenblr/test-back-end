import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanCalculatorComponent } from './loan-calculator/loan-calculator.component';
import { RouterModule, Routes } from '@angular/router';
import { AngularMaterialModule } from '../../angular-material/angular-material.module'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PartialsModule } from '../../../partials/partials.module';
import { RoughLoanAmountComponent } from './loan-calculator/tabs/rough-loan-amount/rough-loan-amount.component';
import { FinalLoanAmountComponent } from './loan-calculator/tabs/final-loan-amount/final-loan-amount.component';
import { LoanApplicationFormComponent } from './loan-application-form/loan-application-form.component';
import { BasicDetailsComponent } from './loan-application-form/tabs/basic-details/basic-details.component';
import { NomineeDetailsComponent } from './loan-application-form/tabs/nominee-details/nominee-details.component'
import { CoreModule } from '../../../../core/core.module';
import { OrnamentsComponent } from './loan-application-form/tabs/ornaments/ornaments.component';
import { FinalInterestAmountComponent } from './loan-calculator/tabs/final-interest-amount/final-interest-amount.component'
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../core/_base/crud';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BankDetailsComponent } from './loan-application-form/tabs/bank-details/bank-details.component';
import { ApprovalComponent } from './loan-application-form/tabs/approval/approval.component';
import { UploadPacketsComponent } from './packets/upload-packets/upload-packets.component';
import { AppliedLoanComponent } from './applied-loan/applied-loan.component';
import { PacketsListComponent } from './packets/packets-list/packets-list.component';
import { AssignPacketsComponent } from './packets/assign-packets/assign-packets.component';
import { InterestCalculatorComponent } from './loan-application-form/tabs/interest-calculator/interest-calculator.component';
import { DeleteEntityDialogComponent } from '../../../partials/content/crud';
import { LoanDetailsComponent } from './loan-details/loan-details.component';
import { DisburseComponent } from './loan-application-form/tabs/disburse/disburse.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UnSecuredSchemeComponent } from './loan-application-form/un-secured-scheme/un-secured-scheme.component';
import { WebcamDialogComponent } from '../kyc-settings/webcam-dialog/webcam-dialog.component';
import { PacketTrackingComponent } from './packets/packet-tracking/packet-tracking.component';
import { UpdateLocationComponent } from './packets/update-location/update-location.component';
import { TopUpComponent } from './top-up/top-up.component';
import { UserReviewComponent } from '../kyc-settings/tabs/user-review/user-review.component';
import { UploadLoanDocumentsComponent } from './loan-application-form/tabs/upload-loan-documents/upload-loan-documents.component';
import { LoanTransferComponent } from './loan-transfer/loan-transfer.component';
import { LoanTransferListComponent } from './loan-transfer-list/loan-transfer-list.component';
import { ViewPacketLogComponent } from './packets/view-packet-log/view-packet-log.component';
const rout: Routes = [
  {
    path: 'loan-calculator',
    component: LoanCalculatorComponent
  },
  {
    path: 'loan-application-form',
    component: LoanApplicationFormComponent
  },
  {
    path: 'loan-application-form/:id',
    component: LoanApplicationFormComponent
  },
  {
    path: 'packet',
    component: PacketsListComponent
  },
  {
    path: 'applied-loan',
    component: AppliedLoanComponent
  },
  {
    path: 'all-loan',
    component: LoanDetailsComponent
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
  {
    path: 'topup',
    component: TopUpComponent
  },
  {
    path: 'loan-transfer',
    component: LoanTransferComponent
  },
  {
    path: 'loan-transfer/:id',
    component: LoanTransferComponent
  },
  {
    path: 'transfer-loan-list',
    component: LoanTransferListComponent
  }
]

@NgModule({
  declarations: [
    LoanCalculatorComponent,
    RoughLoanAmountComponent,
    FinalLoanAmountComponent,
    LoanApplicationFormComponent,
    BasicDetailsComponent,
    NomineeDetailsComponent,
    FinalInterestAmountComponent,
    BankDetailsComponent,
    ApprovalComponent,
    UploadPacketsComponent,
    AppliedLoanComponent,
    PacketsListComponent,
    AssignPacketsComponent,
    InterestCalculatorComponent,
    LoanDetailsComponent,
    DisburseComponent,
    UnSecuredSchemeComponent,
    PacketTrackingComponent,
    UpdateLocationComponent,
    TopUpComponent,
    UploadLoanDocumentsComponent,
    LoanTransferComponent,
    LoanTransferListComponent,
    ViewPacketLogComponent,
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
    UpdateLocationComponent,
    OrnamentsComponent,
    UserReviewComponent,
    ViewPacketLogComponent
  ]
})
export class LoanManagementModule { }
