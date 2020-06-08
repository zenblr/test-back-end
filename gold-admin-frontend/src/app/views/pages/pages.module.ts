// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// Partials
import { PartialsModule } from '../partials/partials.module';
// Pages
import { CoreModule } from '../../core/core.module';
import { UserManagementModule } from './admin/user-management/user-management.module';
import { MyPageComponent } from './my-page/my-page.component';
import { EMIManagementModule } from './admin/emi-management/emi-management.module';
//	import { LogisticPartnerComponent } from './emi-maangement/logistic-partner/logistic-partner.component';

@NgModule({
	declarations: [MyPageComponent,],
	exports: [],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		CoreModule,
		PartialsModule,
		UserManagementModule,
		EMIManagementModule
	],
	providers: []
})
export class PagesModule {
}
