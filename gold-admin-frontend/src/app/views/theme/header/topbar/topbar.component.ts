// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from "@angular/common";


@Component({
	selector: 'kt-topbar',
	templateUrl: './topbar.component.html',
	styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {


	rightButton: boolean = false;
	showfilter: boolean = false
	type1: string;
	value1: string;
	type2: string;
	value2: string;
	type3: string;
	value3: string;
	showInput:boolean
	constructor(private router: Router, private location: Location) {

		this.router.events.subscribe(val => {
			this.reset()
			this.setTopbar(location.path())
		})
	}

	ngOnInit() {
		this.setTopbar(this.router.url)
	}
	reset() {
		this.rightButton = false;
		this.type1 = '';
		this.value1 = '';
		this.type2 = '';
		this.value2 = '';
		 this.type3 = '';
		this.value3 = '';
		this.showfilter = false
		this.showInput = false
	}

	setTopbar(path: string) {
		var pathArray = path.split('/')
		var path = pathArray[pathArray.length - 1]
		console.log(path)
		if (path == 'scheme') {
			this.rightButton = true;
			this.value3 = 'Add New Scheme';
			this.type3 = 'button';
		}
		if (path == 'customer-management') {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = 'Search';
			this.type1 = 'button';
			this.value2 = 'Add New Lead';
			this.type2 = 'button';
		}
	}

	action(event: Event) {
		console.log(event)
	}
}
