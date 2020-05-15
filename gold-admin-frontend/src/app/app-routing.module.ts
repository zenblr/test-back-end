// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Components
import { BaseComponent } from './views/theme/base/base.component';
import { ErrorPageComponent } from './views/theme/content/error-page/error-page.component';
// Auth
import { AuthGuard } from './core/auth';
import { ReverseAuthGuard } from './core/auth/_guards/reverse-auth.guard';

const routes: Routes = [
	{
		path: 'auth', loadChildren: () => import('../app/views/pages/auth/auth.module').then(m => m.AuthModule),
		canActivate: [ReverseAuthGuard]
	},

	{
		path: '',
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'dashboard',
				loadChildren: () => import('../app/views/pages/dashboard/dashboard.module').then(m => m.DashboardModule)
			},
			{
				path: 'admin-account',
				loadChildren: () => import('../app/views/pages/admin-account/admin-account.module').then(m => m.AdminAccountModule)
			},
			{
				path: 'upload-data',
				loadChildren: () => import('../app/views/pages/upload-data/upload-data.module').then(m => m.UploadDataModule)
			},
			{
				path: 'loan-setting',
				loadChildren: () => import('../app/views/pages/loan-settings/loan-settings.module').then(m => m.LoanSettingsModule)
			},
			{
				path: 'loan-management',
				loadChildren: () => import('../app/views/pages/loan-management/loan-management.module').then(m => m.LoanManagementModule)
			},
			{
				path: 'upload-data',
				loadChildren: () => import('../app/views/pages/upload-data/upload-data.module').then(m => m.UploadDataModule),
			},
			{
				path: 'customer-management',
				loadChildren: () => import('../app/views/pages/customer-management/customer-management.module').then(m => m.CustomerManagementModule)
			},
			{
				path: 'kyc-setting',
				loadChildren: () => import('../app/views/pages/kyc-settings/kyc-settings.module').then(m => m.KycSettingsModule)
			},
			{
				path: 'applied-kyc',
				loadChildren: () => import('../app/views/pages/applied-kyc/applied-kyc.module').then(m => m.AppliedKycModule)
			},
			{
				path: 'lead-management',
				loadChildren: () => import('../app/views/pages/lead-management/lead-management.module').then(m => m.LeadManagementModule)
			},
			{
				path: 'user-management',
				loadChildren: () => import('../app/views/pages/user-management/user-management.module').then(m => m.UserManagementModule)
			},
			{
				path: 'emi-management',
				loadChildren: () => import('../app/views/pages/emi-management/emi-management.module').then(m => m.EMIManagementModule)
			},
			{
				path: 'wizard',
				loadChildren: () => import('../app/views/pages/wizard/wizard.module').then(m => m.WizardModule)
			},
			{
				path: 'error/403',
				component: ErrorPageComponent,
				data: {
					type: 'error-v6',
					code: 403,
					title: '403... Access forbidden',
					desc: 'Looks like you don\'t have permission to access for requested page.<br> Please, contact administrator'
				}
			},
			{ path: 'error/:type', component: ErrorPageComponent },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{ path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	},

	{ path: '**', redirectTo: 'error/403', pathMatch: 'full' },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
