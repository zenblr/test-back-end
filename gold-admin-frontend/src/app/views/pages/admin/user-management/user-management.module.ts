// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX


// Translate
import { TranslateModule } from '@ngx-translate/core';
import { PartialsModule } from '../../../partials/partials.module';
// Services
import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from '../../../../core/_base/crud';
// Shared
import { ActionNotificationComponent, DeleteEntityDialogComponent } from '../../../partials/content/crud';
// Components
import { RolesListComponent } from './roles/roles-list/roles-list.component';
import { RoleAddDialogComponent } from './roles/role-add/role-add.dialog.component';

// Material
import { AngularMaterialModule } from '../../angular-material/angular-material.module';

import { NgSelectModule } from '@ng-select/ng-select';

// Module
import { CoreModule } from "../../../../core/core.module";
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
import { AssignAppraiserComponent } from './assign-appraiser/assign-appraiser/assign-appraiser.component';
import { AppraiserListComponent } from './assign-appraiser/appraiser-list/appraiser-list.component';
import { ViewMerchantComponent } from './merchant/view-merchant/view-merchant.component';
import { ApiKeyComponent } from './merchant/api-key/api-key.component';
import { InternalUserBranchListComponent } from './internal-user-branch/internal-user-branch-list/internal-user-branch-list.component';
import { AddInternalUserBranchComponent } from './internal-user-branch/add-internal-user-branch/add-internal-user-branch.component';
import { CreateStoreComponent } from './store/create-store/create-store.component';
import { StoreListComponent } from './store/store-list/store-list.component';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { AddPartnerBranchUserComponent } from './partner-branch-user/add-partner-branch-user/add-partner-branch-user.component';
import { PartnerBranchUserListComponent } from './partner-branch-user/partner-branch-user-list/partner-branch-user-list.component';
import { ConcurrentUserLoginComponent } from './concurrent-user-login/concurrent-user-login.component';
import { SharedService } from '../../../../core/shared/services/shared.service';

let parnter: any = '';
const routes: Routes = [

	{
		path: '',
		redirectTo: parnter,
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
	// {
	// 	path: 'roles',
	// 	component: RolesListComponent
	// },
	// {
	// 	path: 'roles/:id',
	// 	component: PermissionsComponent
	// },
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
		path: 'redirect-assign-appraiser',
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
	{
		path: 'partner-branch-user',
		component: PartnerBranchUserListComponent
	},
	{
		path: 'concurrent-login',
		component: ConcurrentUserLoginComponent
	}

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
		NgxPermissionsModule.forChild(),
		AngularMaterialModule,
		CoreModule,
		NgbModule,
		NgSelectModule
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
		// RoleAddDialogComponent,
		BranchAddComponent,
		PartnerAddComponent,
		AddBrokerComponent,
		AddInternalUserComponent,
		AssignAppraiserComponent,
		ViewMerchantComponent,
		ApiKeyComponent,
		AddInternalUserBranchComponent,
		CreateStoreComponent,
		DeleteEntityDialogComponent,
		AddPartnerBranchUserComponent
	],
	declarations: [
		// RolesListComponent,
		// RoleAddDialogComponent,
		ConcurrentUserLoginComponent,
		PartnerListComponent,
		BranchListComponent,
		BranchAddComponent,
		PartnerAddComponent,
		// PermissionsComponent,
		MerchantComponent,
		UserDetailsComponent,
		CommissionDetailsComponent,
		PermissionComponent,
		BrokerListComponent,
		AddBrokerComponent,
		MerchantListComponent,
		InternalUserListComponent,
		AddInternalUserComponent,
		AppraiserListComponent,
		ViewMerchantComponent,
		ApiKeyComponent,
		InternalUserBranchListComponent,
		AddInternalUserBranchComponent,
		StoreListComponent,
		CreateStoreComponent,
		AddPartnerBranchUserComponent,
		PartnerBranchUserListComponent
	]
})
export class UserManagementModule {

	constructor(private sharedService: SharedService,
		private permission: NgxPermissionsService,
		private router: Router,
	) {
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				console.log(event)
				if (event.url == '/admin/user-management') {
					this.userManagementRoute()
				}

			}
		});
	}
	userManagementRoute() {
		let userManagementPermission = this.sharedService.getUserManagmentPermission()
		let userPermission = []
		let permission = JSON.parse(localStorage.getItem('UserDetails'))
		// console.log(Object.keys(res).length)
		permission.permissions.forEach(ele => {
			userPermission.push(ele.description)
		})
		// })

		this.compareBothPermission(userManagementPermission, userPermission)
	}

	compareBothPermission(managementPermission, userPermission) {
		for (let i = 0; i < managementPermission.length; i++) {
			const management = managementPermission[i];
			for (let j = 0; j < userPermission.length; j++) {
				const user = userPermission[j];
				if (management == user) {
					var title = user
					i = managementPermission.length
					break;
				}
			}
		}
		this.routeToPage(title)
		console.log(title)
	}

	routeToPage(permission) {

		switch (permission) {
			case 'partnerView':
				parnter = 'partner'
				this.router.navigate(['/admin/user-management/partner'])
				break;
			case 'partnerBranchView':
				parnter = 'branch'
				this.router.navigate(['/admin/user-management/branch'])
				break;
			case 'internalUserView':
				this.router.navigate(['/admin/user-management/internal-user'])
				break;
			case 'internalBranchView':
				this.router.navigate(['/admin/user-management/internal-user-branch'])
				break;
			case 'merchantView':
				this.router.navigate(['/admin/user-management/merchant'])
				break;
			case 'brokerView':
				this.router.navigate(['/admin/user-management/broker'])
				break;
			case 'storeView':
				this.router.navigate(['/admin/user-management/store'])
				break;
			case 'concurrentLoginView':
				this.router.navigate(['/admin/user-management/concurrent-login'])
				break;
			case 'partnerBranchUserView':
				this.router.navigate(['/admin/user-management/partner-branch-user'])
				break;

			default:
				// this.router.navigate(['/admin/user-management/partner-branch-user'])
				break;
		}
	}
}
