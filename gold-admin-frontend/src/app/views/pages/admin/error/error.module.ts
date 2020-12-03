import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error.component';
import { Routes, RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
// Modules
import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../../partials/partials.module';

const rout: Routes = [
  { path: '', component: ErrorComponent }
]


@NgModule({
  declarations: [ErrorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(rout),
    AngularMaterialModule,
    CoreModule,
    PartialsModule
  ]
})
export class ErrorModule { }
