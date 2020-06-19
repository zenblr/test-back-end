import { Component, Input, OnInit } from '@angular/core';
import { SparklineChartOptions } from '../../../../../core/_base/layout';

@Component({
	selector: 'custom-kt-widget26',
	templateUrl: './custom-widget26.component.html',
	styleUrls: ['./custom-widget26.component.scss']
})
export class CustomWidget26Component implements OnInit {

	@Input() value: string | number;
	@Input() desc: string;

	constructor() { }

	ngOnInit() { }

}
