// Anglar
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
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
	NumberDirective,
} from "./_base/layout";
// Services
import { AuthService } from "./auth/_services/auth.service";
import { AlphabetsDirective } from "./_base/layout/directives/alphabets.directive";
import { DecimalOnlyDirective } from "./_base/layout/directives/decimal-only.directive";
import { SchemeAmountPipe } from "./_base/layout/pipes/scheme-amount.pipe";
import { ExcelService, PdfService } from "./_base/crud";
import { IndianCurrencyFormatPipe } from './_base/layout/pipes/indian-currency-format.pipe';
import { TruncatePipe } from './_base/layout/pipes/truncate-text.pipe';
import { RemoveCommaPipe } from './_base/layout/pipes/remove-comma.pipe';
import { WeightDirective } from './_base/layout/directives/weight.directive';
import { Time24to12Pipe } from './_base/layout/pipes/time24to12.pipe';
import { MAT_DATE_LOCALE } from '@angular/material';
import { ZeroToHundredWholeDirective } from './_base/layout/directives/zero-to-hundred-whole.directive';

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
		IndianCurrencyFormatPipe,
		TruncatePipe,
		RemoveCommaPipe,
		WeightDirective,
		Time24to12Pipe,
		ZeroToHundredWholeDirective,
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
		WeightDirective,
		ZeroToHundredWholeDirective,
		// pipes
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		SafePipe,
		SchemeAmountPipe,
		FirstLetterPipe,
		AlphabetsDirective,
		DecimalOnlyDirective,
		IndianCurrencyFormatPipe,
		TruncatePipe,
		RemoveCommaPipe,
		Time24to12Pipe,
	],
	providers: [AuthService, ExcelService, PdfService,
		{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
	],
})
export class CoreModule { }
