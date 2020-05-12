// Anglar
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Layout Directives
// Services
import {
	ContentAnimateDirective,
	FirstLetterPipe,
	GetObjectPipe,
	HeaderDirective,
	JoinPipe,
	MenuDirective,
	OffcanvasDirective,
	SafePipe,
	ScrollTopDirective,
	SparklineChartDirective,
	StickyDirective,
	TabClickEventDirective,
	TimeElapsedPipe,
	ToggleDirective,
	NumberDirective
} from './_base/layout';
// Services
import { AuthService } from './auth/_services/auth.service';
import { AlphabetsDirective } from './_base/layout/directives/alphabets.directive';
import { DecimalOnlyDirective } from './_base/layout/directives/decimal-only.directive';
import { SchemeAmountPipe } from './_base/layout/pipes/scheme-amount.pipe';
import { ExcelService } from './_base/crud';

@NgModule({
	imports: [CommonModule],
	declarations: [
		// directives
		ScrollTopDirective,
		HeaderDirective,
		OffcanvasDirective,
		ToggleDirective,
		MenuDirective,
		TabClickEventDirective,
		SparklineChartDirective,
		ContentAnimateDirective,
		StickyDirective,
		NumberDirective,
		// pipes
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		SafePipe,
		FirstLetterPipe,
		AlphabetsDirective,
		DecimalOnlyDirective,
		SchemeAmountPipe,
	],
	exports: [
		// directives
		ScrollTopDirective,
		HeaderDirective,
		OffcanvasDirective,
		ToggleDirective,
		MenuDirective,
		TabClickEventDirective,
		SparklineChartDirective,
		ContentAnimateDirective,
		StickyDirective,
		NumberDirective,
		// pipes
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		SafePipe,
		SchemeAmountPipe,
		FirstLetterPipe,
		AlphabetsDirective,
		DecimalOnlyDirective
	],
	providers: [
		AuthService,
		ExcelService
	]
})
export class CoreModule { }
