// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { Subscription } from 'rxjs';

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
	modules: any[] = []
	checkedModules: any[] = []
	isDisabled = false;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<RoleEditDialogComponent>
	 * @param data: any
	 * 
	 */
	constructor(public dialogRef: MatDialogRef<RoleAddDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		
		private fb: FormBuilder,
		private roleService: RolesService,
		private toast: ToastrService,
	) { }

	ngOnInit() {
		this.getAllModules()
		this.getCloneRole();
		this.initForm();
		if (this.data.action == 'add') {
			this.title = 'Add Role'
		} else {
			this.title = 'Edit Role'
		}

	}

	initForm() {
		this.roleForm = this.fb.group({
			roleName: ['', Validators.required],
			roleId: [''],
			description: [''],
			moduleId: [[], Validators.required]
		})
	}
	setData() {
		this.roleForm.patchValue(this.data.role);
		this.checkedModules = []
		this.data.role.modules.forEach(editMod => {
			this.modules.forEach(mod => {
				if (editMod.id == mod.id)
					mod.isSelected = true;
			})
		});
		console.log(this.modules, this.checkedModules)
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
				this.modules.forEach(mod => {
					mod.isSelected = false;
				})
				console.log(this.modules)
				if (this.data.action != 'add'){
					this.setData()
				}
			}),
			catchError(err => {
				this.toast.error(err.error.message)
				throw err;
			})).subscribe()
	}

	getModules() {
		this.modules.forEach(mod => {
			mod.isSelected = false;
		})
		if (this.controls.roleId.value == '') {
			this.isDisabled = false
			return
		}
		this.roleService.getModule(this.controls.roleId.value).pipe(
			map(res => {
				this.controls.moduleId.patchValue(res)
				this.checkedModules = res;
				this.modules.forEach(mod => {
					if (this.checkedModules.includes(mod.id))
						mod.isSelected = true;
				})
				console.log(this.modules)
				this.isDisabled = true
			}),
			catchError(err => {
				// this.toast.error(err.error.message)
				throw err;
			})).subscribe()
	}

	onModuleSelect(event, index) {
		this.controls.moduleId.markAsUntouched()
		if (event) {
			this.modules[index].isSelected = true
			
		} else {
			this.modules[index].isSelected = false;

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

	submit() {
		let temp = [];
		this.modules.filter(ele=>{
			if(ele.isSelected){
				temp.push(ele.id)
			}
		})
		this.controls.moduleId.patchValue(temp)

		if (this.roleForm.invalid) {
			this.roleForm.markAllAsTouched();
			return
		}
		
		if (this.data.action == 'add') {
			if (this.controls.roleId.value == '') {
				this.controls.roleId.patchValue(0)
			} else {
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
		} else {
			this.controls.roleId.patchValue(Number(this.controls.roleId.value))
			this.roleService.editRole(this.data.role.id, this.roleForm.value).pipe(
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
