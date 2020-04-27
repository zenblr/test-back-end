// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription } from 'rxjs';

import { Store, } from '@ngrx/store';
// State
import { AppState } from '../../../../../core/reducers';
// Services and Models
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RolesService } from '../../../../../core/user-management/roles';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';

@Component({
	selector: 'kt-role-add-dialog',
	templateUrl: './role-add.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class RoleAddDialogComponent implements OnInit, OnDestroy {
	// Public properties

	roleForm: FormGroup;
	// Private properties
	private componentSubscriptions: Subscription;
	title: string;
	cloneRoles: any[] = [];
	modules:any[]=[]
	checkedModules:any [] = [0]
	isDisabled=false;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<RoleEditDialogComponent>
	 * @param data: any
	 * @param store: Store<AppState>
	 */
	constructor(public dialogRef: MatDialogRef<RoleAddDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private store: Store<AppState>,
		private fb: FormBuilder,
		private roleService: RolesService,
		private toast: ToastrService,
	) { }

	ngOnInit() {
		this.initForm();
		this.getCloneRole();
		this.getAllModules()
		console.log(this.data)
		if (this.data.action == 'add') {
			this.title = 'Add Role'
		} else {
			this.title = 'Edit Role'
			this.roleForm.patchValue(this.data.role);
			this.checkedModules = []
			this.data.role.modules.forEach(mod => {
				this.checkedModules.push(mod.id)
			});
			this.controls.moduleId.patchValue(this.checkedModules)
		}

	}

	initForm() {
		this.roleForm = this.fb.group({
			roleName: ['', Validators.required],
			roleId: [''],
			description: [''],
			moduleId:[[],Validators.required]
		})
	}

	getCloneRole() {
		this.roleService.getCloneRole().pipe(
			map(res => {
				this.cloneRoles = res
			}),
			catchError(err => {
				this.toast.error(err.error.message)
				throw err;
			})).subscribe()
	}

	getAllModules() {
		this.roleService.getAllModule().pipe(
			map(res => {
				
				this.modules = res;
			}),
			catchError(err => {
				this.toast.error(err.error.message)
				throw err;
			})).subscribe()
	}

	getModules() {
		if(this.controls.roleId.value == ''){
			this.checkedModules = [0];
			this.isDisabled = false
			return
		}
		this.roleService.getModule(this.controls.roleId.value).pipe(
			map(res => {
				this.controls.moduleId.patchValue(res)
				let temp = this.modules
				this.modules = [];
				this.modules = temp
				this.checkedModules = res;
				this.isDisabled = true
			}),
			catchError(err => {
				this.toast.error(err.error.message)
				throw err;
			})).subscribe()
	}

	onModuleSelect(value,event,index){
		let temp = [];
		// Array.prototype.push.apply(temp,this.controls.modules.value)
		if(event){
			temp = this.controls.moduleId.value;
			temp.push(value)
			this.controls.moduleId.patchValue(temp)
	
		}else{
			temp = this.controls.moduleId.value;
			temp.splice(index,1)
			this.controls.moduleId.patchValue(temp)
		}
		
	}

	get controls() {
		return this.roleForm.controls;
	}

	action(event: Event) {
		if (event) {
			this.submit()
		} else if (!event) {
			this.dialogRef.close()
		}
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	submit(){
		if (this.roleForm.invalid) {
			this.roleForm.markAllAsTouched();
			return 
		}
		if(this.data.action == 'add'){
			if(this.controls.roleId.value == ''){
				this.controls.roleId.patchValue(0)
			}else{
			this.controls.roleId.patchValue(Number(this.controls.roleId.value))
			}
			this.roleService.addRole(this.roleForm.value).pipe(
				map(res => {
					this.toast.success("Role Created Successfully")
					this.dialogRef.close(res)
				}),
				catchError(err => {
					this.toast.error(err.error.message)
					throw err;
				})).subscribe()
		}else{
			this.controls.roleId.patchValue(Number(this.controls.roleId.value))
			this.roleService.editRole(this.data.role.id,this.roleForm.value).pipe(
				map(res => {
					this.toast.success("Role Updated Successfully")
					this.dialogRef.close(res)
				}),
				catchError(err => {
					this.toast.error(err.error.message)
					throw err;
				})).subscribe()
		}
		
		
	}


}
