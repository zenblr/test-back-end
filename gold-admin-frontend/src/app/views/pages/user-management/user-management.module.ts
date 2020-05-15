// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX


// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../core/_base/crud';
// Shared
import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { RolesListComponent } from './roles/roles-list/roles-list.component';
import { RoleAddDialogComponent } from './roles/role-add/role-add.dialog.component';

// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';


// Module
import { CoreModule } from "../../../core/core.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { PartnerListComponent } from './partner/partner-list/partner-list.component';
import { BranchListComponent } from './branch/branch-list/branch-list.component';
import { BranchAddComponent } from './branch/branch-add/branch-add.component';
import { PartnerAddComponent } from './partner/partner-add/partner-add.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { MerchantComponent } from './merchant/add-merchant/merchant.component';
import { UserDetailsComponent } from './merchant/add-merchant/tabs/user-details/user-details.component';
import { CommissionDetailsComponent } from './merchant/add-merchant/tabs/commission-details/commission-details.component';
import { PermissionComponent } from './merchant/add-merchant/tabs/permission/permission.component';
import { LoanSchemeComponent } from '../loan-settings/loan-scheme/loan-scheme.component';
import { BrokerListComponent } from './broker/broker-list/broker-list.component';
import { AddBrokerComponent } from './broker/add-broker/add-broker.component';
import { MerchantListComponent } from './merchant/merchant-list/merchant-list.component';
import { InternalUserListComponent } from './internal-user/internal-user-list/internal-user-list.component';
import { AddInternalUserComponent } from './internal-user/add-internal-user/add-internal-user.component';
import { AddAppraiserComponent } from './assign-appraiser/add-appraiser/add-appraiser.component';
import { AppraiserListComponent } from './assign-appraiser/appraiser-list/appraiser-list.component';
import { ViewMerchantComponent } from './merchant/view-merchant/view-merchant.component';
import { ApiKeyComponent } from './merchant/api-key/api-key.component';
import { InternalUserBranchListComponent } from './internal-user-branch/internal-user-branch-list/internal-user-branch-list.component';
import { AddInternalUserBranchComponent } from './internal-user-branch/add-internal-user-branch/add-internal-user-branch.component';
import { CreateStoreComponent } from './store/create-store/create-store.component';
import { StoreListComponent } from './store/store-list/store-list.component';


const routes: Routes = [

	{
		path: '',
		redirectTo: 'partner',
		pathMatch: 'full'
	},
	{
		path: 'partner',
		component: PartnerListComponent
	},
	{
		path: 'partner/view-schemes/:id',
		component: LoanSchemeComponent,
	},
	{
		path: 'roles',
		component: RolesListComponent
	},
	{
		path: 'roles/:id',
		component: PermissionsComponent
	},
	{
		path: 'internal-user',
		component: InternalUserListComponent,
	},
	{
		path: 'internal-user-branch',
		component: InternalUserBranchListComponent,
	},
	{
		path: 'assign-appraiser',
		component: AppraiserListComponent,
	},
	{
		path: 'branch',
		component: BranchListComponent
	},
	{
		path: 'broker',
		component: BrokerListComponent
	},
	{
		path: 'merchant',
		component: MerchantListComponent
	},
	{
		path: 'add-merchant',
		component: MerchantComponent
	},
	{
		path: 'edit-merchant/:id',
		component: MerchantComponent
	},
	{
		path: 'store',
		component: StoreListComponent
	},

]

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
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
		RoleAddDialogComponent,
		BranchAddComponent,
		PartnerAddComponent,
		AddBrokerComponent,
		AddInternalUserComponent,
		AddAppraiserComponent,
		ViewMerchantComponent,
		ApiKeyComponent,
		AddInternalUserBranchComponent,
		CreateStoreComponent
	],
	declarations: [
		RolesListComponent,
		RoleAddDialogComponent,
		PartnerListComponent,
		BranchListComponent,
		BranchAddComponent,
		PartnerAddComponent,
		PermissionsComponent,
		MerchantComponent,
		UserDetailsComponent,
		CommissionDetailsComponent,
		PermissionComponent,
		BrokerListComponent,
		AddBrokerComponent,
		MerchantListComponent,
		InternalUserListComponent,
		AddInternalUserComponent,
		AddAppraiserComponent,
		AppraiserListComponent,
		ViewMerchantComponent,
		ApiKeyComponent,
		InternalUserBranchListComponent,
		AddInternalUserBranchComponent,
		StoreListComponent,
		CreateStoreComponent
	]
})
export class UserManagementModule { }
