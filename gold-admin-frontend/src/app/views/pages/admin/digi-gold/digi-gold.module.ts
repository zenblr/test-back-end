import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../../partials/partials.module';
import { DigiGoldComponent } from './digi-gold.component';
import { GlobalSettingsComponent } from './global-settings/global-settings.component';

const routes: Routes = [
	{
		path: '',
		component: DigiGoldComponent,
		children: [
			{
				path: '',
				redirectTo: 'sip-management',
				pathMatch: 'full'
			},
			{
				path: 'sip-management',
				loadChildren: () => import('./sip-management/sip-management.module').then(m => m.SipManagementModule)
			},
			{
				path: 'wallet',
				loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletModule)
			},
			{
				path: 'global-settings',
				component: GlobalSettingsComponent
			},
		],
	},
]

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		RouterModule.forChild(routes),
	],
	providers: [],
	declarations: [
		DigiGoldComponent,
		GlobalSettingsComponent,
	
	]
})
export class DigiGoldModule { }
