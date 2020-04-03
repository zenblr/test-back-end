import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router'
import { AngularMaterialModule} from '../angular-material/angular-material.module'
import { PartialsModule} from '../../partials/partials.module'
import { LoanStatusComponent } from './loan-status/loan-status.component';
import { LoanSchemeComponent } from './loan-scheme/loan-scheme.component';
import { InterceptService, HttpUtilsService, TypesUtilsService, LayoutUtilsService } from '../../../core/_base/crud';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ActionNotificationComponent } from '../../partials/content/crud';
import { StoreModule } from '@ngrx/store';
import { usersReducer, UserEffects } from '../../../core/auth';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: 'loan-status', component: LoanStatusComponent },
  { path: 'scheme', component: LoanSchemeComponent },
]

@NgModule({
  declarations: [
    LoanStatusComponent, 
    LoanSchemeComponent
  ],
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
    AngularMaterialModule
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
  entryComponents: [
    ActionNotificationComponent,
  ],
})
export class LoanSettingsModule { }
