// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { AdminComponent } from './admin.component';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		RouterModule.forChild([
			{
				path: '',
				component: AdminComponent,
				children: [
					{
						path: 'dashboard',
						loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
					},
					{
						path: 'admin-account',
						loadChildren: () => import('./admin-account/admin-account.module').then(m => m.AdminAccountModule)
					},
					{
						path: 'upload-data',
						loadChildren: () => import('./upload-data/upload-data.module').then(m => m.UploadDataModule)
					},
					{
						path: 'loan-setting',
						loadChildren: () => import('./loan-settings/loan-settings.module').then(m => m.LoanSettingsModule)
					},
					{
						path: 'notification-setting',
						loadChildren: () => import('./notification-settings/notification-settings.module').then(m => m.NotificationSettingsModule)
					},
					{
						path: 'loan-management',
						loadChildren: () => import('./loan-management/loan-management.module').then(m => m.LoanManagementModule)
					},
					{
						path: 'upload-data',
						loadChildren: () => import('./upload-data/upload-data.module').then(m => m.UploadDataModule),
					},
					{
						path: 'customer-management',
						loadChildren: () => import('./customer-management/customer-management.module').then(m => m.CustomerManagementModule)
					},
					{
						path: 'kyc-setting',
						loadChildren: () => import('./kyc-settings/kyc-settings.module').then(m => m.KycSettingsModule)
					},
					{
						path: 'applied-kyc',
						loadChildren: () => import('./applied-kyc/applied-kyc.module').then(m => m.AppliedKycModule)
					},
					{
						path: 'lead-management',
						loadChildren: () => import('./lead-management/lead-management.module').then(m => m.LeadManagementModule)
					},
					{
						path: 'user-management',
						loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule)
					},
					{
						path: 'emi-management',
						loadChildren: () => import('./emi-management/emi-management.module').then(m => m.EMIManagementModule)
					},
					{
						path: 'repayment',
						loadChildren: () => import('./repayment/repayment.module').then(m => m.RepaymentModule)
					},
					{
						path: 'global-settings',
						loadChildren: () => import('./settings/global-settings/global-settings.module').then(m => m.GlobalSettingsModule)
					},
					{
						path: 'masters',
						loadChildren: () => import('./masters/masters.module').then(m => m.MastersModule)
					},
					{
						path: 'holidays',
						loadChildren: () => import('./holidays/holidays.module').then(m => m.HolidaysModule)
					},
					{
						path: 'assigned-customers',
						loadChildren: () => import('./assigned-customers/assigned-customers.module').then(m => m.AssignedCustomersModule)
					},
					{
						path: 'account',
						loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
					},
					{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
					{ path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
				]
			},
		]),
	],
	providers: [],
	declarations: [
		AdminComponent,
	]
})
export class AdminModule {
}
