import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ConfigDetailsComponent} from './config-details.component';
import { WalletPriceComponent } from './wallet-price/wallet-price.component';




@NgModule({
  declarations: [
    ConfigDetailsComponent,
    WalletPriceComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ConfigDetailsModule { }
