import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { CommonModule } from '@angular/common';
// Components
import { UploadBannerComponent } from './upload-banner/upload-banner.component';
// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { UploadOfferComponent } from './upload-offer/upload-offer.component';
import { UploadLenderBannerComponent } from './upload-lender-banner/upload-lender-banner.component';

import { ReactiveFormsModule, FormsModule } from "@angular/forms";
// ngx-permission
import { NgxPermissionsModule } from 'ngx-permissions';
import { GoldRateComponent } from './gold-rate/gold-rate.component'

const routes: Routes = [
  {

    path: 'upload-banner',
    component: UploadBannerComponent

  },
  {
    path: 'upload-offer',
    component: UploadOfferComponent
  },
  {
    path: 'upload-lender-banner',
    component: UploadLenderBannerComponent
  },
  {
    path: 'gold-rate',
    component: GoldRateComponent
  }
]

@NgModule({
  declarations: [
    UploadBannerComponent,
    UploadOfferComponent,
    UploadLenderBannerComponent,
    GoldRateComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    PartialsModule,
    AngularMaterialModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    ReactiveFormsModule,
    FormsModule,
    
  ]
})
export class UploadDataModule { }
