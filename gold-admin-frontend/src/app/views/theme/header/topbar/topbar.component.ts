// Angular
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'kt-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
	constructor() { }

	ngOnInit() {

	}

	action(event) {
		console.log(event)
	}
}
