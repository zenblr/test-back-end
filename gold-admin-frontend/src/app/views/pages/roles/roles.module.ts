import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesComponent } from './roles.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module'
import { Routes, RouterModule } from '@angular/router'

const routes: Routes = [

  {
    path: '',
    component: RolesComponent
  }
]

@NgModule({
  declarations: [RolesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AngularMaterialModule
  ]
})
export class RolesModule { }
