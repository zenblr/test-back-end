// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
// NGRX

// Translate
import { TranslateModule } from "@ngx-translate/core";
import { PartialsModule } from "../../../partials/partials.module";
import { NgxPermissionsModule } from 'ngx-permissions';
// Services
import {
	HttpUtilsService,
	TypesUtilsService,
	InterceptService,
	LayoutUtilsService,
} from "../../../../core/_base/crud";
// Shared
import {
	ActionNotificationComponent,
	DeleteEntityDialogComponent,
} from "../../../partials/content/crud";
// Material
import { AngularMaterialModule } from "../../angular-material/angular-material.module";
// Module
import { CoreModule } from "../../../../core/core.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {
	MatDialogModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MAT_DIALOG_DATA,
	MatDialogRef,
} from "@angular/material/dialog";

// Components
import { EMIManagementComponent } from "./emi-management.component";
import { SubCategoryListComponent } from "./product/sub-category/sub-category-list/sub-category-list.component";
import { SubCategoryAddComponent } from "./product/sub-category/sub-category-add/sub-category-add.component";
import { CategoryListComponent } from "./product/category/category-list/category-list.component";
import { BulkUploadProductComponent } from "./product/bulk-upload-product/bulk-upload-product.component";
import { UploadDesignComponent } from "./product/upload-design/upload-design.component";
import { BulkUploadReportListComponent } from "./bulk-upload-report/bulk-upload-report-list/bulk-upload-report-list.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { WalletPriceListComponent } from "./config-details/wallet-price/wallet-price-list/wallet-price-list.component";
import { WalletPriceAddComponent } from "./config-details/wallet-price/wallet-price-add/wallet-price-add.component";
import { CategoryAddComponent } from "./product/category/category-add/category-add.component";
import { ProductListComponent } from "./product/show-product/product-list/product-list.component";
import { ProductEditComponent } from "./product/show-product/product-edit/product-edit.component";
import { AdminLogListComponent } from "./config-details/admin-log/admin-log-list/admin-log-list.component";
import { AddLogisticPartnerComponent } from "./logisticPartner/add-logistic-partner/add-logistic-partner.component";
import { ListLogisticPartnerComponent } from "./logisticPartner/list-logistic-partner/list-logistic-partner.component";
import { OrderDetailsListComponent } from "./order-management/order-details/order-details-list/order-details-list.component";
import { OrderDetailsViewComponent } from "./order-management/order-details/order-details-view/order-details-view.component";
import { CancelOrderDetailsListComponent } from "./order-management/cancel-order-details/cancel-order-details-list/cancel-order-details-list.component";
import { DepositDetailsListComponent } from "./order-management/deposit-details/deposit-details-list/deposit-details-list.component";
import { EmiDetailsListComponent } from "./order-management/emi-details/emi-details-list/emi-details-list.component";
import { EmiDetailsViewComponent } from "./order-management/emi-details/emi-details-view/emi-details-view.component";
import { OrderDetailsEditComponent } from "./order-management/order-details/order-details-edit/order-details-edit.component";
import { RefundDetailsComponent } from "./order-management/refund-details/refund-details-list/refund-details.component";
import { RefundDetailsEditComponent } from "./order-management/refund-details/refund-details-edit/refund-details-edit.component";
import { CustomerDetailsListComponent } from "./customer-details/customer-details-list/customer-details-list.component";
import { ReportsComponent } from "./reports/reports.component";
import { RefundDetailsViewComponent } from "./order-management/refund-details/refund-details-view/refund-details-view.component";
import { OrderCancelDialogComponent } from './order-management/order-details/order-cancel-dialog/order-cancel-dialog.component';
import { DepositDetailsEditComponent } from "./order-management/deposit-details/deposit-details-edit/deposit-details-edit.component";

const routes: Routes = [
	{
		path: "",

		component: EMIManagementComponent,

		children: [
			{ path: "", redirectTo: "dashboard", pathMatch: "full" },
			{
				path: "dashboard",
				component: DashboardComponent,
			},
			{
				path: "products",
				component: ProductListComponent,
			},
			{
				path: "category",
				component: CategoryListComponent,
			},
			{
				path: "sub-category",
				component: SubCategoryListComponent,
			},
			{
				path: "bulk-upload-product",
				component: BulkUploadProductComponent,
			},
			{
				path: "bulk-edit-product",
				component: BulkUploadProductComponent,
			},
			{
				path: "upload-design",
				component: UploadDesignComponent,
			},
			{
				path: "bulk-upload-report",
				component: BulkUploadReportListComponent,
			},
			{
				path: "wallet-price",
				component: WalletPriceListComponent,
			},
			{
				path: "admin-log",
				component: AdminLogListComponent,
			},
			{
				path: "logistic-partner",
				component: ListLogisticPartnerComponent,
			},
			{
				path: "order-details",
				component: OrderDetailsListComponent,
			},
			{
				path: "order-details/edit-order-details/:id",
				component: OrderDetailsEditComponent,
			},
			{
				path: "order-details/cancel-order/:id",
				component: OrderCancelDialogComponent,
			},
			{
				path: "cancel-order-details",
				component: CancelOrderDetailsListComponent,
			},
			{
				path: "deposit-details",
				component: DepositDetailsListComponent,
			},
			{
				path: "emi-details",
				component: EmiDetailsListComponent,
			},
			{
				path: "refund-details",
				component: RefundDetailsComponent,
			},
			{
				path: "customers",
				component: CustomerDetailsListComponent,
			},
			{
				path: "reports",
				component: ReportsComponent,
			},
			{
				path: "refund-details/edit-refund-details/:id",
				component: RefundDetailsEditComponent,
			},
		],
	},
];

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		NgxPermissionsModule.forChild(),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		AngularMaterialModule,
		CoreModule,
		NgbModule,
		MatDialogModule,
	],
	providers: [
		InterceptService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true,
		},
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: "kt-mat-dialog-container__wrapper",
				height: "auto",
				width: "600px",
			},
		},
		{ provide: MAT_DIALOG_DATA, useValue: {} },
		{ provide: MatDialogRef, useValue: {} },

		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService,
	],
	entryComponents: [
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		WalletPriceAddComponent,
		CategoryAddComponent,
		ProductEditComponent,
		SubCategoryAddComponent,
		AddLogisticPartnerComponent,
		OrderDetailsViewComponent,
		EmiDetailsViewComponent,
		RefundDetailsViewComponent,
		DepositDetailsEditComponent
	],
	declarations: [
		EMIManagementComponent,
		ProductEditComponent,
		ProductListComponent,
		CategoryListComponent,
		BulkUploadProductComponent,
		UploadDesignComponent,
		BulkUploadReportListComponent,
		DashboardComponent,
		WalletPriceListComponent,
		WalletPriceAddComponent,
		CategoryAddComponent,
		SubCategoryAddComponent,
		SubCategoryListComponent,
		AdminLogListComponent,
		AddLogisticPartnerComponent,
		ListLogisticPartnerComponent,
		OrderDetailsListComponent,
		OrderDetailsViewComponent,
		CancelOrderDetailsListComponent,
		DepositDetailsListComponent,
		EmiDetailsListComponent,
		EmiDetailsViewComponent,
		OrderDetailsEditComponent,
		RefundDetailsEditComponent,
		CustomerDetailsListComponent,
		ReportsComponent,
		RefundDetailsViewComponent,
		OrderCancelDialogComponent,
		DepositDetailsEditComponent
	],
})
export class EMIManagementModule { }
