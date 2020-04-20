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
  }
]

@NgModule({
  declarations: [
    UploadBannerComponent,
    UploadOfferComponent,
    UploadLenderBannerComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    PartialsModule,
    AngularMaterialModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    
  ]
})
export class UploadDataModule { }
