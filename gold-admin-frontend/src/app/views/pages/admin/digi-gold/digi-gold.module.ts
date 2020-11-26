// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../../partials/partials.module';
import { DigiGoldComponent } from './digi-gold.component';


@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		RouterModule.forChild([
			{
				path: '',
				component: DigiGoldComponent,
				children: [
					{
						path: 'sip-management',
						loadChildren: () => import('./sip-management/sip-management.module').then(m => m.SipManagementModule)
					},
					{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
					{ path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
				]
			},
		]),
	],
	providers: [],
	declarations: [
		DigiGoldComponent,
	]
})
export class DigiGoldModule {
}
