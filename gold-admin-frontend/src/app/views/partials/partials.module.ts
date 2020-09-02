// Angular
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "../pages/angular-material/angular-material.module";
// NgBootstrap
import {
	NgbDropdownModule,
	NgbTabsetModule,
	NgbTooltipModule,
	NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
// Perfect Scrollbar
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
// Core module
import { CoreModule } from "../../core/core.module";
// CRUD Partials
import {
	ActionNotificationComponent,
	AlertComponent,
	DeleteEntityDialogComponent,
	FetchEntityDialogComponent,
	UpdateStatusDialogComponent,
} from "./content/crud";
// Layout partials
import {
	ContextMenu2Component,
	ContextMenuComponent,
	LanguageSelectorComponent,
	NotificationComponent,
	QuickActionComponent,
	QuickPanelComponent,
	ScrollTopComponent,
	SearchDefaultComponent,
	SearchDropdownComponent,
	SearchResultComponent,
	SplashScreenComponent,
	StickyToolbarComponent,
	Subheader1Component,
	Subheader2Component,
	Subheader3Component,
	Subheader4Component,
	Subheader5Component,
	SubheaderSearchComponent,
	UserProfile2Component,
	UserProfile3Component,
	UserProfileComponent,
} from "./layout";
// General
import { NoticeComponent } from "./content/general/notice/notice.component";
import { PortletModule } from "./content/general/portlet/portlet.module";
// Errpr
import { ErrorComponent } from "./content/general/error/error.component";
// Extra module
import { WidgetModule } from "./content/widgets/widget.module";
// map
import { AgmCoreModule } from '@agm/core';

// SVG inline
import { InlineSVGModule } from "ng-inline-svg";
import { CartComponent } from "./layout/topbar/cart/cart.component";
import { ToastrComponent } from "./components/toastr/toastr.component";
import { ButtonComponent } from "./components/button/button.component";
import { FilterComponent } from "./components/filter/filter.component";
import { SearchComponent } from "./components/search/search.component";
import { ModalHeaderComponent } from "./components/modal/modal-header/modal-header.component";
import { ModalFooterComponent } from "./components/modal/modal-footer/modal-footer.component";
import { LoanSchemeComponent } from "../pages/admin/loan-settings/loan-scheme/loan-scheme.component";
import { FilteredDataComponent } from './components/filtered-data/filtered-data.component';

// spinner
import { UplodDataImageComponent } from "./components/uplod-data-image/uplod-data-image.component";
import { ImagePreviewDialogComponent } from "./components/image-preview-dialog/image-preview-dialog.component";
import { BasicDetailsComponent } from "./components/basic-details/basic-details.component";
import { UploadDocumentsComponent } from "./components/upload-documents/upload-documents.component";
import { UserClassificationComponent } from "./components/user-classification/user-classification.component";
import { UplodPreviewImageComponent } from "./components/uplod-preview-image/uplod-preview-image.component";
import { BankDetailsComponent } from "./components/bank-details/bank-details.component";
import { ApprovalComponent } from "./components/approval/approval.component";
import { UploadPacketsComponent } from "./components/upload-packets/upload-packets.component";
import { DisburseComponent } from "./components/disburse/disburse.component";

import { NgSelectModule } from "@ng-select/ng-select";
import { UserReviewComponent } from "../pages/admin/kyc-settings/tabs/user-review/user-review.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { MultiSelectSearchComponent } from "./components/multi-select-search/multi-select-search.component";
import { AssignAppraiserComponent } from '../pages/admin/user-management/assign-appraiser/assign-appraiser/assign-appraiser.component';

import { WebcamModule } from "ngx-webcam";
import { WebcamDialogComponent } from '../pages/admin/kyc-settings/webcam-dialog/webcam-dialog.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { OrnamentsComponent } from './components/ornaments/ornaments.component';
import { ImageFunctionalityDialogComponent } from './components/image-functionality-dialog/image-functionality-dialog.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';

import { AngularImageViewerModule } from 'angular-x-image-viewer';
import { DropdownComponent } from './components/dropdown/dropdown.component';

import { GlobalSettingsComponent } from './components/global-settings/global-settings.component';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { LoanScrapDetailsComponent } from './components/loan-scrap-details/loan-scrap-details.component';
import { PaymentDialogComponent } from './components/payment-dialog/payment-dialog.component';
import { LocationComponent} from './components/location/location.component'

@NgModule({
	declarations: [
		ScrollTopComponent,
		NoticeComponent,
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		AlertComponent,

		// topbar components
		ContextMenu2Component,
		ContextMenuComponent,
		QuickPanelComponent,
		ScrollTopComponent,
		SearchResultComponent,
		SplashScreenComponent,
		StickyToolbarComponent,
		Subheader1Component,
		Subheader2Component,
		Subheader3Component,
		Subheader4Component,
		Subheader5Component,
		SubheaderSearchComponent,
		LanguageSelectorComponent,
		NotificationComponent,
		QuickActionComponent,
		SearchDefaultComponent,
		SearchDropdownComponent,
		UserProfileComponent,
		UserProfile2Component,
		UserProfile3Component,
		CartComponent,
		ErrorComponent,
		ToastrComponent,
		ButtonComponent,
		FilterComponent,
		SearchComponent,
		ModalHeaderComponent,
		ModalFooterComponent,
		UplodDataImageComponent,
		ImagePreviewDialogComponent,
		LoanSchemeComponent,
		BasicDetailsComponent,
		UploadDocumentsComponent,
		UserClassificationComponent,
		UplodPreviewImageComponent,
		UserReviewComponent,
		AssignAppraiserComponent,
		WebcamDialogComponent,
		FilteredDataComponent,
		MultiSelectSearchComponent,
		AssignAppraiserComponent,
		OrnamentsComponent,
		PdfViewerComponent,
		ImageFunctionalityDialogComponent,
		DropdownComponent,
		GlobalSettingsComponent,
		BankDetailsComponent,
		ApprovalComponent,
		UploadPacketsComponent,
		DisburseComponent,
		CustomerDetailsComponent,
		LoanScrapDetailsComponent,
		PaymentDialogComponent,
		LocationComponent

	],
	exports: [
		WidgetModule,
		PortletModule,
		ScrollTopComponent,
		NoticeComponent,
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		AlertComponent,

		// topbar components
		ContextMenu2Component,
		ContextMenuComponent,
		QuickPanelComponent,
		ScrollTopComponent,
		SearchResultComponent,
		SplashScreenComponent,
		StickyToolbarComponent,
		Subheader1Component,
		Subheader2Component,
		Subheader3Component,
		Subheader4Component,
		Subheader5Component,
		SubheaderSearchComponent,
		LanguageSelectorComponent,
		NotificationComponent,
		QuickActionComponent,
		SearchDefaultComponent,
		SearchDropdownComponent,
		UserProfileComponent,
		UserProfile2Component,
		UserProfile3Component,
		CartComponent,

		ErrorComponent,
		ToastrComponent,
		ButtonComponent,
		FilterComponent,
		SearchComponent,
		ModalHeaderComponent,
		ModalFooterComponent,

		UplodDataImageComponent,
		ImagePreviewDialogComponent,
		LoanSchemeComponent,
		BasicDetailsComponent,
		UploadDocumentsComponent,
		UserClassificationComponent,
		UplodPreviewImageComponent,
		UserReviewComponent,
		FilteredDataComponent,
		AssignAppraiserComponent,
		WebcamDialogComponent,
		// spinner
		NgbDropdownModule,
		NgxPermissionsModule,
		WebcamModule,
		NgxMaterialTimepickerModule,
		MultiSelectSearchComponent,
		OrnamentsComponent,
		PdfViewerComponent,

		AngularImageViewerModule,
		DropdownComponent,
		GlobalSettingsComponent,
		BankDetailsComponent,
		ApprovalComponent,
		UploadPacketsComponent,
		DisburseComponent,
		CustomerDetailsComponent,
		LoanScrapDetailsComponent,
		PaymentDialogComponent,
		LocationComponent
	],
	imports: [
		PdfViewerModule,
		NgbModule,
		CommonModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		PerfectScrollbarModule,
		InlineSVGModule,
		CoreModule,
		PortletModule,
		WidgetModule,
		NgxPermissionsModule.forChild(),

		AgmCoreModule,

		AngularMaterialModule,
		// ng-bootstrap modules
		NgbDropdownModule,
		NgbTabsetModule,
		NgbTooltipModule,
		NgbModule,
		NgSelectModule,
		WebcamModule,
		NgxMaterialTimepickerModule.setLocale('en-IN'),
		AngularImageViewerModule,
	],

	entryComponents: [
		PdfViewerComponent,
		ImagePreviewDialogComponent,
		ImageFunctionalityDialogComponent,
		OrnamentsComponent,
		WebcamDialogComponent
	],
})
export class PartialsModule {
}
