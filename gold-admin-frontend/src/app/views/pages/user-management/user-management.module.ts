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
import { UserManagementComponent } from './user-management.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { RolesListComponent } from './roles/roles-list/roles-list.component';
import { RoleAddDialogComponent } from './roles/role-add/role-add.dialog.component';
import { UserRolesListComponent } from './users/_subs/user-roles/user-roles-list.component';
import { ChangePasswordComponent } from './users/_subs/change-password/change-password.component';
import { AddressComponent } from './users/_subs/address/address.component';
import { SocialNetworksComponent } from './users/_subs/social-networks/social-networks.component';

// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import {
	usersReducer,
	UserEffects
} from '../../../core/auth';
import { PartnerListComponent } from './partner/partner-list/partner-list.component';
import { BranchListComponent } from './branch/branch-list/branch-list.component';
import { BranchAddComponent } from './branch/branch-add/branch-add.component';
import { PartnerAddComponent } from './partner/partner-add/partner-add.component';
import { PermissionsComponent } from './permissions/permissions.component';

const routes: Routes = [
	{
		path: '',
		component: UserManagementComponent,
		children: [
			{
				path: '',
				redirectTo: 'roles',
				pathMatch: 'full'
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
				path: 'partner',
				component: PartnerListComponent
			},
			{
				path: 'branch',
				component: BranchListComponent
			},
			{
				path: 'users',
				component: UsersListComponent
			},
			{
				path: 'users:id',
				component: UsersListComponent
			},
			{
				path: 'users/add',
				component: UserEditComponent
			},
			{
				path: 'users/add:id',
				component: UserEditComponent
			},
			{
				path: 'users/edit',
				component: UserEditComponent
			},
			{
				path: 'users/edit/:id',
				component: UserEditComponent
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
		AngularMaterialModule	],
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
		PartnerAddComponent
	],
	declarations: [
		UserManagementComponent,
		UsersListComponent,
		UserEditComponent,
		RolesListComponent,
		RoleAddDialogComponent,
		UserRolesListComponent,
		ChangePasswordComponent,
		AddressComponent,
		SocialNetworksComponent,
		PartnerListComponent,
		BranchListComponent,
		BranchAddComponent,
		PartnerAddComponent,
		PermissionsComponent
	]
})
export class UserManagementModule { }
