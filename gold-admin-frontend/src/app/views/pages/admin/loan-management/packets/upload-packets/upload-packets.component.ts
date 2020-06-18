import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { PacketsService } from '../../../../../../core/loan-management';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { WebcamDialogComponent } from '../../../kyc-settings/webcam-dialog/webcam-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'kt-upload-packets',
  templateUrl: './upload-packets.component.html',
  styleUrls: ['./upload-packets.component.scss']
})
export class UploadPacketsComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() viewpacketsDetails;
  @ViewChild('form', { static: false }) form;
  @ViewChild('emptyPacketWithNoOrnament', { static: false }) emptyPacketWithNoOrnament: ElementRef
  @ViewChild('packetWithAllOrnaments', { static: false }) packetWithAllOrnaments: ElementRef
  @ViewChild('packetWithSealing', { static: false }) packetWithSealing: ElementRef
  @ViewChild('packetWithWeight', { static: false }) packetWithWeight: ElementRef
  packetImg: FormGroup;
  left: number = 0
  width: number = 0
  packetsDetails: any[] = []
  packetInfo: FormGroup;
  loanId: number = 0;
  packetsName: any;
  url: string;
  @Input() ornamentType
  ornamentName: any;

  constructor(
    private sharedService: SharedService,
    private ele: ElementRef,
    public fb: FormBuilder,
    private packetService: PacketsService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
    private ref: ChangeDetectorRef,
    private dilaog: MatDialog
  ) { }


  ngOnChanges(change: SimpleChanges) {
    if (change.ornamentType && change.ornamentType.currentValue) {
      this.ornamentType = change.ornamentType.currentValue.ornamentType
      this.ornamentType.map(ele => ele.disabled = false)
    }
  }



  ngOnInit() {
    this.initForm()
    this.getPacketsDetails()

    this.url = this.router.url.split('/')[2]
    this.loanId = this.route.snapshot.params.id

    this.packetImg = this.fb.group({
      packetsArray: this.fb.array([])
    })

    if (this.viewpacketsDetails) {
      const array = this.viewpacketsDetails.loanPacketDetails
      for (let index = 0; index < array.length; index++) {
        this.controls.packetId.patchValue(array[index].packetId)
        this.addmore()
        const pack = this.packets.at(index) as FormGroup;
        pack.patchValue(array[index])
        pack.patchValue({ packetsName: array[index].packet.packetUniqueId })
        console.log(pack)
        // pack.at(inde).patchValue(array[index])
      }

      console.log(this.viewpacketsDetails.loanPacketDetails)
    }
  }

  initForm() {
    this.packetInfo = this.fb.group({
      ornamentType: [null, Validators.required],
      packetId: [null, Validators.required],
    })
  }

  get packets() {
    if (this.packetImg) {
      return this.packetImg.controls.packetsArray as FormArray
    }
  }

  get controls() {
    if (this.packetInfo) {
      return this.packetInfo.controls
    }
  }

  getPacketsDetails() {
    this.packetService.getPacketsAvailable().pipe(
      map(res => {
        this.packetsDetails = res.data;
        this.packetsDetails.map(ele => ele.disabled = false)
      })
    ).subscribe()
  }

  ngAfterViewInit() {
  }

  addmore() {
    if (this.packetInfo.invalid) {
      this.packetInfo.markAllAsTouched();
      return;
    }
    // if (this.left < 650) {
    //   this.width = this.width + 130

    //   if (this.left == 0)
    //     this.left = this.left + 150
    //   else if (this.left > 0)
    //     this.left = this.left + 130

    //   const left = (this.left).toString() + 'px'
    //   const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
    //   const addmore = (this.ele.nativeElement.querySelector('.addMore') as HTMLElement);
    //   width.style.maxWidth = left
    //   addmore.style.left = left

    // } else {
    //   const addmore = (this.ele.nativeElement.querySelector('.addMore') as HTMLElement);
    //   addmore.style.left = '670px'
    //   const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
    //   width.style.maxWidth = '680px'

    // }
    if (this.url != 'view-loan')
      this.removePackets()

    this.packets.push(this.fb.group({
      emptyPacketWithNoOrnament: ['', Validators.required],
      packetWithAllOrnaments: ['', Validators.required],
      packetWithSealing: ['', Validators.required],
      packetWithWeight: ['', Validators.required],
      packetId: [this.controls.packetId.value],
      packetsName: [this.packetsName],
      ornamentsName:[this.ornamentName]
    }))

    this.form.resetForm()

  }

  removePacketsTab(idx) {

    // let ornamnetsWidth = this.packets.length * 130
    // if (ornamnetsWidth <= this.width) {
    //   this.left = this.left - 130
    //   const left = (this.left).toString() + 'px'
    //   const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
    //   width.style.maxWidth = left
    //   const addmore = (this.ele.nativeElement.querySelector('.addMore') as HTMLElement);
    //   addmore.style.left = left

    // }
    this.packets.removeAt(idx)
  }

  clear() {
    this.packetWithAllOrnaments.nativeElement.value = '';
    this.emptyPacketWithNoOrnament.nativeElement.value = '';
    this.packetWithSealing.nativeElement.value = '';
    this.packetWithWeight.nativeElement.value = ''
  }

  uploadFile(index, value, event) {
    var name = event.target.files[0].name
    var ext = name.split('.')
    if (ext[ext.length - 1] == 'jpg' || ext[ext.length - 1] == 'png' || ext[ext.length - 1] == 'jpeg') {
      this.sharedService.uploadFile(event.target.files[0]).pipe(
        map(res => {

        }),
        catchError(err => {
          throw err
        }), finalize(() => {
          this.clear()
        })).subscribe()
    } else {
      this.toast.error('Upload Valid File Format');
    }
  }

  removePackets() {
    let arrayIndex = this.packets.length
    const controls = this.packets.at(arrayIndex) as FormGroup;

    let index = this.packetsDetails.findIndex(ele => {
      return ele.id == this.controls.packetId.value;
    })
    this.packetsName = this.packetsDetails[index]
    this.packetsDetails[index].disabled = true

    let ornamnetsIndex = this.ornamentType.findIndex(ele => {
      return ele.id == this.controls.ornamentType.value;
    })
    this.ornamentName = this.ornamentType[ornamnetsIndex]
    this.ornamentType[index].disabled = true    
    console.log(this.controls.packetId.value)

    // this.packetsDetails.splice(index, 1)
  }

  save() {
    if (this.packetImg.invalid) {
      this.packetImg.markAllAsTouched()
      return
    }
    const _title = 'Save Packet';
    const _description = 'Are you sure ,you want to save packets?';
    const _waitDesciption = 'Packet is saving...';
    const _deleteMessage = `Packet has been saved`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.packetService.uploadPackets(this.packets.value, this.loanId).pipe(
          map(res => {
            this.toast.success(res.message)
            this.router.navigate(['/admin/loan-management/applied-loan'])
          })
        ).subscribe()
      }
      // this.store.dispatch(new RoleDeleted({ id: _item.id }));
      // this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
    });

  }

  deletePacket(idx) {
    const _title = 'Delete Packet';
    const _description = 'Are you sure to permanently delete this packet?';
    const _waitDesciption = 'Packet is deleting...';
    const _deleteMessage = `Packet has been deleted`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const controls = this.packets.at(idx) as FormGroup;
        let index = this.packetsDetails.findIndex(ele => {
          return ele.id == controls.controls.packetsName.value.id;
        })
        this.packetsDetails[index].disabled = false
        this.packets.removeAt(idx);
        this.ref.detectChanges()
      }
      // this.store.dispatch(new RoleDeleted({ id: _item.id }));
      // this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
    });
  }

  webcam(index, event, value) {
    const dialogRef = this.dilaog.open(WebcamDialogComponent,
      {
        data: {},
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.sharedService.uploadBase64File(res.imageAsDataUrl).subscribe(res => {
          console.log(res)
          const packet = this.packets.at(index) as FormArray
          packet.controls[value].patchValue(res.uploadFile.URL)
          console.log(this.packets.value)
          // this.profile = res.uploadFile.URL
          // this.personalForm.get('profileImage').patchValue(this.profile);
          this.ref.detectChanges()
        })
        // this.controls.
      }
    });
  }

}
