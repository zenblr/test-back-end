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
// SVG inline
import { InlineSVGModule } from "ng-inline-svg";
import { CartComponent } from "./layout/topbar/cart/cart.component";
import { ToastrComponent } from "./components/toastr/toastr.component";
import { ButtonComponent } from "./components/button/button.component";
import { FilterComponent } from "./components/filter/filter.component";
import { SearchComponent } from "./components/search/search.component";
import { ModalHeaderComponent } from "./components/modal/modal-header/modal-header.component";
import { ModalFooterComponent } from "./components/modal/modal-footer/modal-footer.component";
import { LoanSchemeComponent } from "../../views/pages/loan-settings/loan-scheme/loan-scheme.component";

// spinner
import { UplodDataImageComponent } from "./components/uplod-data-image/uplod-data-image.component";
import { ImagePreviewDialogComponent } from "./components/image-preview-dialog/image-preview-dialog.component";
import { UserClassificationComponent } from "./components/user-classification/user-classification.component";
import { UplodPreviewImageComponent } from "./components/uplod-preview-image/uplod-preview-image.component";
import { SelectWithSearchComponent } from "./components/select-with-search/select-with-search.component";

import { NgSelectModule } from "@ng-select/ng-select";
import { UserReviewComponent } from "../pages/kyc-settings/tabs/user-review/user-review.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { MultiSelectSearchComponent } from "./components/multi-select-search/multi-select-search.component";

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

		UserClassificationComponent,

		UplodPreviewImageComponent,

		SelectWithSearchComponent,
		UserReviewComponent,
		MultiSelectSearchComponent,
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
		UserClassificationComponent,
		UplodPreviewImageComponent,
		SelectWithSearchComponent,
		UserReviewComponent,
		// spinner
		NgxPermissionsModule,
		MultiSelectSearchComponent,
	],
	imports: [
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

		AngularMaterialModule,
		// ng-bootstrap modules
		NgbDropdownModule,
		NgbTabsetModule,
		NgbTooltipModule,
		NgbModule,
		NgSelectModule,

		// spinner
	],
	entryComponents: [ImagePreviewDialogComponent],
})
export class PartialsModule {}
