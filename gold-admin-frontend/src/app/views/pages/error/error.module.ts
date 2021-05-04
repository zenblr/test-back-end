import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PartialsModule } from '../../partials/partials.module';
import { ErrorComponent } from './error.component';

const routes: Routes = [
  { path: '', component: ErrorComponent }
];

@NgModule({
  declarations: [ErrorComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PartialsModule,
  ]
})
export class ErrorModule { }
