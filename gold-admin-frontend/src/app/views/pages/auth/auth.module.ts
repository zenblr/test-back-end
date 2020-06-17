// Angular
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
// Material
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule ,MatProgressSpinnerModule} from '@angular/material';
// Translate
import { TranslateModule } from '@ngx-translate/core';

// Module components
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { ChangePassword } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthNoticeComponent } from './auth-notice/auth-notice.component';
import { SignInWithOtpComponent } from './sign-in-with-otp/sign-in-with-otp.component';
import { SignUpBrokerComponent } from './sign-up-broker/sign-up-broker.component';
import { CoreModule } from '../../../core/core.module';

// Auth
import { AuthGuard, AuthService } from '../../../core/auth';
import { PartialsModule } from '../../partials/partials.module';

const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		children: [
			{
				path: '',
				redirectTo: 'login',
				pathMatch: 'full'
			},
			{
				path: 'login',
				component: LoginComponent,
				data: { returnUrl: window.location.pathname }
			},
			{
				path: 'sign-in-otp',
				component: SignInWithOtpComponent
			},
			{
				path: 'otp',
				component: SignInWithOtpComponent
			},
			{
				path: 'change-password',
				component: ChangePassword,
			},
			{
				path: 'forgot-password',
				component: ForgotPasswordComponent,
			}
		]
	}
];


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		RouterModule.forChild(routes),
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		TranslateModule.forChild(),
		PartialsModule,
		CoreModule
	],
	providers: [
		
	],
	exports: [AuthComponent],
	declarations: [
		AuthComponent,
		LoginComponent,
		ChangePassword,
		ForgotPasswordComponent,
		AuthNoticeComponent,
		SignInWithOtpComponent,
		SignUpBrokerComponent
	],
	entryComponents: [SignUpBrokerComponent]
})

export class AuthModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: AuthModule,
			providers: [
				AuthService,
				AuthGuard
			]
		};
	}
}
