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
  constructor(
    private permissionService: PermissionService,
    private rout: ActivatedRoute,
    private toast: ToastrService,
    public ref:ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getPermission()
  }

  getPermission() {
    this.permissionService.getPermission(this.rout.snapshot.params.id).pipe(
      map(res => {
        this.permissions = res.allPermissions;
        this.ref.detectChanges();
      }), catchError(err => {
        this.toast.error(err.error.message)
        throw err
      })).subscribe()
  }
}
