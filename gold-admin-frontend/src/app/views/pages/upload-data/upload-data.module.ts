import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { CommonModule } from '@angular/common';
// Components
import { UploadBannerComponent } from './upload-banner/upload-banner.component';
import { UploadDataComponent } from './upload-data.component';
// Material
import { AngularMaterialModule } from '../angular-material/angular-material.module';

const routes: Routes = [
  {
    path: '',
    component: UploadDataComponent,
    children: [
      {
        path: '',
        redirectTo: 'upload-banner',
        pathMatch: 'full'
      },
      {
        path: 'upload-banner',
        component: UploadBannerComponent
      },
      {
        path: '**',
        redirectTo: 'upload-banner',
        pathMatch: 'full'
      },
    ]
  }
]

@NgModule({
  declarations: [UploadBannerComponent, UploadDataComponent],
  imports: [
    CommonModule,
    CoreModule,
    PartialsModule,
    AngularMaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class UploadDataModule { }
