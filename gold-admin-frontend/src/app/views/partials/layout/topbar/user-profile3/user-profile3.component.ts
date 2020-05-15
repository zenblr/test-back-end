// Angular
import { Component, Input, OnInit } from '@angular/core';
// RxJS
import { Observable } from 'rxjs';
// NGRX

// State


@Component({
	selector: 'kt-user-profile3',
	templateUrl: './user-profile3.component.html',
})
export class UserProfile3Component implements OnInit {
	// Public properties

	@Input() avatar = true;
	@Input() greeting = true;
	@Input() badge: boolean;
	@Input() icon: boolean;

	/**
	 * Component constructor
	 *
	 * 
	 */
	constructor() {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		
	}

	

}
