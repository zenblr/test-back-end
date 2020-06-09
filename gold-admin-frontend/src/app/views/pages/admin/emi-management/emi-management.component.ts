// Angular
import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
// RxJS
import { Observable } from "rxjs";
// NGRX
// AppState
// Auth
import { Permission } from "../../../../core/auth";

const userManagementPermissionId = 2;
@Component({
	selector: "kt-emi-management",
	templateUrl: "./emi-management.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EMIManagementComponent implements OnInit {
	// Public properties
	// hasUserAccess$: Observable<boolean>;
	currentUserPermission$: Observable<Permission[]>;

	/**
	 * Component constructor
	 *
	 *
	 * @param router: Router
	 */
	constructor(private router: Router) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// this.currentUserPermission$ = this.store.pipe(select(currentUserPermissions));
		// this.currentUserPermission$.subscribe(permissions => {
		// 	if (permissions && permissions.length > 0) {
		// 		this.hasUserAccess$ =
		// 			this.store.pipe(select(checkHasUserPermission(userManagementPermissionId)));
		// 		this.hasUserAccess$.subscribe(res => {
		// 			if (!res) {
		// 				this.router.navigateByUrl('/error/403');
		// 			}
		// 		});
		// 	}
		// });
	}
}
