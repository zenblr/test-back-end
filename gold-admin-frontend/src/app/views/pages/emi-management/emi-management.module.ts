// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import { ShowProductsComponent } from './product/show-products/show-products.component';
import { CategoryComponent } from './product/category/category.component';
import { SubCategoryComponent } from './product/sub-category/sub-category.component';
import { UploadProductComponent } from './product/upload-product/upload-product.component';
import { UploadDesignComponent } from './product/upload-design/upload-design.component';
import { BulkUploadReportComponent } from './bulk-upload-report/bulk-upload-report.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ConfigDetailsComponent } from './config-details/config-details.component';
import { WalletPriceComponent } from './config-details/wallet-price/wallet-price.component';

const routes: Routes = [
	{
		path: '',
		component: EMIManagementComponent,
		children: [
			{
				path: '',
				redirectTo: 'products',
				pathMatch: 'full'
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
	],
	declarations: [
		EMIManagementComponent,
		ProductComponent,
		ShowProductsComponent,
		CategoryComponent,
		SubCategoryComponent,
		UploadProductComponent,
		UploadDesignComponent,
		BulkUploadReportComponent,
		DashboardComponent,
		ConfigDetailsComponent,
		WalletPriceComponent,

	]
})
export class EMIManagementModule { }
