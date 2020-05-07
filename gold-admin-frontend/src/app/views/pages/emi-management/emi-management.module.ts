// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {ProductListComponent} from './product/show-product/product-list/product-list.component';
import {ProductEditComponent} from './product/show-product/product-edit/product-edit.component';
// NGRX
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { EMIManagementComponent } from './emi-management.component';
import {SubCategoryListComponent} from './product/sub-category/sub-category-list/sub-category-list.component';
import {SubCategoryAddEditComponent} from './product/sub-category/sub-category-add-edit/sub-category-add-edit.component';

// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import {
	usersReducer,
	UserEffects
} from '../../../core/auth';

// Module
import { CoreModule } from "../../../core/core.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ProductComponent } from './product/product.component';
import { CategoryComponent } from './product/category/category.component';

import { UploadProductComponent } from './product/upload-product/upload-product.component';
import { UploadDesignComponent } from './product/upload-design/upload-design.component';
import { BulkUploadReportListComponent } from './bulk-upload-report/bulk-upload-report-list/bulk-upload-report-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConfigDetailsComponent } from './config-details/config-details.component';
import { WalletPriceListComponent } from './config-details/wallet-price/wallet-price-list/wallet-price-list.component';
import { WalletPriceAddComponent } from './config-details/wallet-price/wallet-price-add/wallet-price-add.component';
import { AddEditCategoryComponent } from './product/category/add-edit-category/add-edit-category.component';
import {ProductViewComponent} from './product/show-product/product-view/product-view.component';


const routes: Routes = [
		{ path: '' ,

		component: EMIManagementComponent,

		children: [
			{ path: '', redirectTo: 'products', pathMatch: 'full' },
			{
				path: 'products',
				component: ProductListComponent
			},
			{
				path: 'category',
				component: CategoryComponent
			},
			{
				path: 'sub-category',
				component: SubCategoryListComponent
			},
			{
				path: 'upload-product',
				component: UploadProductComponent
			},
			{
				path: 'upload-design',
				component: UploadDesignComponent
			},
			{
				path: 'bulkUploadReport',
				component: BulkUploadReportListComponent
			},
			{
				path: 'wallet-price',
				component: WalletPriceListComponent
			},
		]
		} 
];

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('users', usersReducer),
		EffectsModule.forFeature([UserEffects]),
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		AngularMaterialModule,
		CoreModule,
		NgbModule,
	],
	providers: [
		InterceptService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true
		},
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService
	],
	entryComponents: [
		ActionNotificationComponent,
		WalletPriceAddComponent,
		AddEditCategoryComponent,
		ProductEditComponent,
		ProductViewComponent,
		SubCategoryAddEditComponent
		
	],
	declarations: [
		EMIManagementComponent,
		ProductEditComponent,
		ProductListComponent,
		ProductComponent,
		CategoryComponent,
		
		UploadProductComponent,
		UploadDesignComponent,
		BulkUploadReportListComponent,
		DashboardComponent,
		ConfigDetailsComponent,
		WalletPriceListComponent,
		WalletPriceAddComponent,
		AddEditCategoryComponent,
		ProductViewComponent,
		SubCategoryAddEditComponent,
		SubCategoryListComponent,

	]
})
export class EMIManagementModule { }
