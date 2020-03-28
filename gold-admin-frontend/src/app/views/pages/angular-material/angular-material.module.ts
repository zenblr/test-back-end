import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatInputModule,
  MatFormFieldModule,
  MatDatepickerModule,
  MatAutocompleteModule,
  MatListModule,
  MatSliderModule,
  MatCardModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
  MatNativeDateModule,
  MatSlideToggleModule,
  MatCheckboxModule,
  MatMenuModule,
  MatTabsModule,
  MatTooltipModule,
  MatSidenavModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatTableModule,
  MatGridListModule,
  MatToolbarModule,
  MatBottomSheetModule,
  MatExpansionModule,
  MatDividerModule,
  MatSortModule,
  MatStepperModule,
  MatChipsModule,
  MatPaginatorModule,
  MatDialogModule,
  MatRippleModule,
  MatRadioModule,
  MatTreeModule,
  MatButtonToggleModule,
} from '@angular/material';

const MaterialModule = [
  MatInputModule,
  MatFormFieldModule,
  MatDatepickerModule,
  MatAutocompleteModule,
  MatListModule,
  MatSliderModule,
  MatCardModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
  MatNativeDateModule,
  MatSlideToggleModule,
  MatCheckboxModule,
  MatMenuModule,
  MatTabsModule,
  MatTooltipModule,
  MatSidenavModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatTableModule,
  MatGridListModule,
  MatToolbarModule,
  MatBottomSheetModule,
  MatExpansionModule,
  MatDividerModule,
  MatSortModule,
  MatStepperModule,
  MatChipsModule,
  MatPaginatorModule,
  MatDialogModule,
  MatRippleModule,
  MatRadioModule,
  MatTreeModule,
  MatButtonToggleModule,
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule, MaterialModule
  ],
  exports: [MaterialModule]
})
export class AngularMaterialModule { }
