import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrComponent } from "../../../partials/components/toastr/toastr.component";
import { ProfileService } from '../../../../core/broker';
import { ProfileChangePassComponent } from './profile-change-pass/profile-change-pass.component';
import { ProfileChangePanComponent } from './profile-change-pan/profile-change-pan.component';
import { MatDialog } from "@angular/material";
import { ImagePreviewDialogComponent } from '../../../partials/components/image-preview-dialog/image-preview-dialog.component';

@Component({
  selector: 'kt-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;

  profileDetails: any;
  constructor(private profileService: ProfileService,
    public dialog: MatDialog,) { }

  ngOnInit() {
    this.profileService.getProfileDetails().subscribe(res => this.profileDetails = res);
  }

  changePassword() {
    const dialogRef = this.dialog.open(ProfileChangePassComponent, {
      width: "500px", disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.ngOnInit()
      }
    });
  }

  updatePan() {
    const dialogRef = this.dialog.open(ProfileChangePanComponent, {
      width: "500px", disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.ngOnInit()
      }
    });
  }

  open(image) {
    let images = [];
    images.push(image)
    this.dialog.open(ImagePreviewDialogComponent, {
      data: {
        images: images,
        index: 0
      },
      width: "auto"
    })
  }

}
