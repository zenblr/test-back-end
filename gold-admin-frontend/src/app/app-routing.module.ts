// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Components
import { BaseComponent } from './views/theme/base/base.component';
import { ErrorPageComponent } from './views/theme/content/error-page/error-page.component';
// Auth
import { AuthGuard } from './core/auth';
import { ReverseAuthGuard } from './core/auth/_guards/reverse-auth.guard';
import { RoleGuard } from './core/auth/_guards/role.guard';
import { RedirectGuard } from './core/auth/_guards/redirect.guard';

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
				path: 'admin',
				loadChildren: () => import('./views/pages/admin/admin.module').then(m => m.AdminModule)
			},
			{
				path: 'broker',
				loadChildren: () => import('./views/pages/broker/broker.module').then(m => m.MerchantModule),
				// canActivate: [RoleGuard],
				// data: {
				// 	expectedRole: 2
				// }
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
			{ path: '', redirectTo: '', pathMatch: 'full', canActivate: [RedirectGuard] },
			{ path: '**', redirectTo: '', pathMatch: 'full', canActivate: [RedirectGuard] }
		]
	},
	{ path: '**', redirectTo: 'error/403', pathMatch: 'full' },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes)
	],
	providers: [
		RoleGuard
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
