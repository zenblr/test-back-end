import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../../core/core.module';
import { AngularMaterialModule } from '../../../angular-material/angular-material.module'
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { PartialsModule } from '../../../../partials/partials.module';
import { WalletComponent } from './wallet.component';
import { DepositRequestsComponent } from './deposit-requests/deposit-requests/deposit-requests.component';
import { WithdrawalRequestsComponent } from './withdrawal-requests/withdrawal-requests/withdrawal-requests.component';
import { DepositRequestsEditComponent } from './deposit-requests/deposit-requests-edit/deposit-requests-edit.component';
import { WithdrawalRequestsEditComponent } from './withdrawal-requests/withdrawal-requests-edit/withdrawal-requests-edit.component';

const routes: Routes = [
	{
		path: '',
		component: WalletComponent,
		children: [
			{
				path: '',
				redirectTo: 'deposit-requests',
				pathMatch: 'full'
			},
			{
				path: 'deposit-requests',
				component: DepositRequestsComponent
			},
			{
				path: 'withdrawal-requests',
				component: WithdrawalRequestsComponent
			},
			{
				path: 'deposit-requests/:id',
				component: DepositRequestsEditComponent
			},
			{
				path: 'withdrawal-requests/:id',
				component: WithdrawalRequestsEditComponent
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
		AngularMaterialModule,
		ReactiveFormsModule,
		FormsModule
	],
	providers: [],
	declarations: [
		DepositRequestsComponent,
		WithdrawalRequestsComponent,
		WalletComponent,
		DepositRequestsEditComponent,
		WithdrawalRequestsEditComponent,
	]
})
export class WalletModule { }
