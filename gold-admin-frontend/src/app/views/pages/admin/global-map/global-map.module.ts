import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalMapComponent } from './global-map.component';
import { Routes, RouterModule } from '@angular/router';
import { PartialsModule } from '../../../partials/partials.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { CoreModule } from '../../../../core/core.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptService } from '../../../../core/_base/crud';
import { AgmCoreModule } from '@agm/core';

const routes:Routes = [
  {
    path:'',
    component:GlobalMapComponent,
  }
]


@NgModule({
  declarations: [
    GlobalMapComponent
  ],
  imports: [
    CommonModule,
    PartialsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CoreModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    AgmCoreModule,

  ],providers:[
    InterceptService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true
    },
  ]
})
export class GlobalMapModule { }
