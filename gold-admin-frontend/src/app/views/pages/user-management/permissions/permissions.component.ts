import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PermissionService } from '../../../../core/user-management/permission/permission.service';
import { ActivatedRoute } from '@angular/router'
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'kt-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  panelOpenState = false;
  permissions: any[] = []
  selectedPermission:any[]=[]
  id:number=0;
  constructor(
    private permissionService: PermissionService,
    private rout: ActivatedRoute,
    private toast: ToastrService,
    public ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.id = this.rout.snapshot.params.id
    this.getPermission();
    
  }

  getPermission() {
    this.permissionService.getPermission(this.id).pipe(
      map(res => {
        this.permissions = res.permissions;
        this.ref.detectChanges();
      }), catchError(err => {
        this.toast.error(err.error.message)
        throw err
      })).subscribe()
  }

  toogleChange(event, moduleIndex, entityIndex) {
    var toogle = this.permissions[moduleIndex].entity[entityIndex]
    if (event) {
      toogle.isSelected = true;
    } else {
      toogle.isSelected = false;
    }

      for (let index = 0; index < toogle.permission.length; index++) {
        if(event){
        toogle.permission[index].isSelected = true
        this.selectedPermission.push(toogle.permission[index].id)
        }else{
          toogle.permission[index].isSelected = false
          var findIndex = this.selectedPermission.indexOf(toogle.permission[index].id)
          this.selectedPermission.splice(findIndex,1)
        }
      }
      console.log(this.selectedPermission)
      
  }

  actionChange(event, moduleIndex, entityIndex, permissionIndex) {
    var permission = this.permissions[moduleIndex].entity[entityIndex].permission[permissionIndex]
    if (event) {
      permission.isSelected = true
      this.selectedPermission.push(permission.id)
    } else {
      permission.isSelected = false
      var findIndex = this.selectedPermission.indexOf(permission.id)
      this.selectedPermission.splice(findIndex,1)
    }
    console.log(this.selectedPermission)
  }

  submit(){
    this.permissionService.updatePermission(this.selectedPermission,this.id).pipe(
      map(res =>{
        this.toast.success(res.message)
      }),
      catchError(err=>{
        this.toast.error(err.error.message)
        throw err
      })).subscribe()
  }

}
