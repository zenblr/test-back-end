import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { finalize, catchError, map } from 'rxjs/operators';
import { ToastrComponent } from '../toastr/toastr.component';
import { MatDialog } from '@angular/material'
import { ImagePreviewDialogComponent } from '../image-preview-dialog/image-preview-dialog.component';
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions'

@Component({
  selector: 'kt-uplod-data-image',
  templateUrl: './uplod-data-image.component.html',
  styleUrls: ['./uplod-data-image.component.scss']
})
export class UplodDataImageComponent implements OnInit {


  index: number = null;
  @Input() title;
  @Input() images;
  @Input() imgId;
  @Input() reason

  @ViewChild("file", { static: false }) file;
  @ViewChild(ToastrComponent, { static: false }) toastr: ToastrComponent;
  promotionPage = false;
  add: boolean;
  editBanner: boolean;
  deleteBanner: boolean;


  constructor(
    public ngxPermissionService: NgxPermissionsService,
    private ref: ChangeDetectorRef,
    private sharedService: SharedService,
    public dilaog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private ele: ElementRef,
    private toastrService: ToastrService,
    private router: Router
  ) { }


  ngOnInit() {
    this.ngxPermissionService.permissions$.subscribe(res => {
      this.getPermission(res)
    })
    const currentPage = this.router.url;
    if (currentPage == '/admin/upload-data/upload-banner') {
      this.promotionPage = true;
    }
  }

  uploadImages(event) {
    var details = event.target.files
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      if (details.length == 0) {
        this.index == null
      } else {
        var reader = new FileReader()
        var reader = new FileReader();
        const img = new Image();
        img.src = window.URL.createObjectURL(details[0]);
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (_event) => {
          setTimeout(() => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            window.URL.revokeObjectURL(img.src);
            if (width !== 600 || height !== 300) {
              this.toastrService.error('Please Upload Image of Valid Size');
            } else {
              this.sharedService.uploadFile(details[0],this.reason).pipe(map(res => {
                if (this.index != null) {
                  this.images.splice(this.index, 1, res.uploadFile.URL)
                  this.imgId.splice(this.index, 1, res.uploadFile.id)
                  this.index = null;
                } else {
                  this.images.push(res.uploadFile.URL)
                  this.imgId.push(res.uploadFile.id)
                }
                this.ref.detectChanges();
              }),
                catchError(err => {
                  this.toastrService.error('Please try Again');
                  throw err
                }), finalize(() => {
                  this.file.nativeElement.value = ''
                })).subscribe()
            }
            this.ref.detectChanges();
          }, 2000);
        }

      }
    } else {
      this.toastrService.error('Upload Valid File Format');
    }
  }

  edit(index: number) {
    this.file.nativeElement.click()
    this.index = index;
  }

  removeImages(index) {

    const _title = 'Delete Banner';
    const _description = 'Are you sure to permanently delete this banner?';
    const _waitDesciption = 'Banner is deleting...';
    const _deleteMessage = 'Banner has been deleted';

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.images.splice(index, 1);
        this.imgId.splice(index, 1);
        this.ref.detectChanges();
      }
    });



  }

  open(index) {
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: this.images,
        index: index
      },
      width: "auto"
    })
  }

  reset() {
    this.add = false;
    this.editBanner = false;
    this.deleteBanner = false;
  }

  getPermission(permission) {
    this.reset()
    if (location.href.includes('upload-banner')) {
      if (permission.promotionalBannerAdd)
        this.add = true
      if (permission.promotionalBannerEdit)
        this.editBanner = true
      if (permission.promotionalBannerDelete)
        this.deleteBanner = true
    }
    if (location.href.includes('upload-offer')) {
      if (permission.offerBannerAdd)
        this.add = true
      if (permission.offerBannerEdit)
        this.editBanner = true
      if (permission.offerBannerDelete)
        this.deleteBanner = true

    }
    if (location.href.includes('upload-lender-banner')) {
      if (permission.partnerBannerAdd)
        this.add = true
      if (permission.partnerBannerEdit)
        this.editBanner = true
      if (permission.partnerBannerDelete)
        this.deleteBanner = true
    }
    console.log(this.add,this.editBanner,this.deleteBanner)
  }
}
