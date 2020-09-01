import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesListComponent } from '../../user-management/roles/roles-list/roles-list.component';
import { PermissionsComponent } from '../../user-management/permissions/permissions.component';
import { RoleAddDialogComponent } from '../../user-management/roles/role-add/role-add.dialog.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PartialsModule } from '../../../../partials/partials.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AngularMaterialModule } from '../../../angular-material/angular-material.module';
import { CoreModule } from '../../../../../core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../../../core/_base/crud';

const routes = [
	{
		path: '',
		component: RolesListComponent
	},
	{
		path: ':id',
		component: PermissionsComponent
	},
]

@NgModule({
	declarations: [RoleAddDialogComponent, RolesListComponent, PermissionsComponent],
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
	entryComponents: [RoleAddDialogComponent]
})
export class RolesPermissionsModule { }
