import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
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
  styleUrls: ['./upload-packets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadPacketsComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() viewpacketsDetails;
  @Input() masterAndLoanIds;
  @ViewChild('form', { static: false }) form;
  @ViewChild('emptyPacketWithNoOrnament', { static: false }) emptyPacketWithNoOrnament: ElementRef
  @ViewChild('sealingPacketWithWeight', { static: false }) sealingPacketWithWeight: ElementRef
  @ViewChild('sealingPacketWithCustomer', { static: false }) sealingPacketWithCustomer: ElementRef
  @ViewChild('packetWithWeight', { static: false }) packetWithWeight: ElementRef
  packetImg: FormGroup;
  left: number = 0
  width: number = 0
  packetsDetails: any[] = []
  packetInfo: FormGroup;
  packetsName: any;
  url: string;
  @Input() ornamentType: any = []
  ornamentTypeData = []
  ornamentName: any;
  clearData: boolean;
  splicedOrnaments: any[] = []
  splicedPackets: any[] = []
  ornamentId: any;
  @Output() next: EventEmitter<any> = new EventEmitter();

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
  ) {

  }


  ngOnChanges(change: SimpleChanges) {
    if (change.ornamentType && change.ornamentType.currentValue && change.ornamentType.currentValue.ornamentType) {
      let ornamentType = change.ornamentType.currentValue.ornamentType
      console.log(this.ornamentType)
      var temp = []
      ornamentType.forEach(ele => {
        temp.push(ele.ornamentType)
      });

      this.ornamentTypeData = temp
    }

    if (change.viewpacketsDetails && change.viewpacketsDetails.currentValue) {
      let packet = change.viewpacketsDetails.currentValue.loanPacketDetails[0]
      if (packet) {
        this.packetImg.patchValue(packet)
        console.log(packet.packets)
        packet.packets.forEach(ele => {
          this.packetsName = ele.packetUniqueId;
          this.ornamentName = ele.ornamentTypes.map(e => e.name).toString();
          this.pushPackets()
        });
        this.url = 'view-loan'
      }
    }
  }



  ngOnInit() {
    this.initForm()
    this.getPacketsDetails()
    this.url = this.router.url.split('/')[3]
    this.masterAndLoanIds = this.route.snapshot.params.id

    this.packetImg = this.fb.group({
      emptyPacketWithNoOrnament: ['', Validators.required],
      emptyPacketWithNoOrnamentImage: ['', Validators.required],
      sealingPacketWithWeight: ['', Validators.required],
      sealingPacketWithWeightImage: ['', Validators.required],
      sealingPacketWithCustomer: ['', Validators.required],
      sealingPacketWithCustomerImage: ['', Validators.required],
      packetOrnamentArray: this.fb.array([])
    })

  }

  initForm() {
    this.packetInfo = this.fb.group({
      ornamentType: [null, Validators.required],
      packetId: [null, Validators.required],
    })
  }

  get packets() {
    if (this.packetImg) {
      return this.packetImg.controls.packetOrnamentArray as FormArray
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

      })
    ).subscribe()
    // this.packetsDetails = [{ packetUniqueId: 'PAC-2', id: 2 }, { packetUniqueId: 'PAC-2', id: 1 }]
    // this.packetsDetails.map(ele => ele.disabled = false)
  }

  ngAfterViewInit() {
  }

  addmore() {
    if (this.packetInfo.invalid) {
      this.packetInfo.markAllAsTouched();
      return;
    }

    if (this.url != 'view-loan')
      this.removePackets()

    this.pushPackets()



    setTimeout(() => {
      this.clearData = false;
      this.form.resetForm()
      this.ref.detectChanges();
    })
  }
  pushPackets() {
    this.packets.push(this.fb.group({
      packetId: [this.controls.packetId.value],
      ornamentsId: [this.ornamentId],
      packetsName: [this.packetsName],
      ornamentsName: [this.ornamentName]
    }))
  }



  removeSelectedPacketsData(idx) {
    console.log(this.packets.controls[idx])
    let packetIndex = this.splicedPackets.findIndex(packet => {
      return packet.id == this.packets.controls[idx].value.packetId
    })
    this.packetsDetails.push(this.splicedPackets[packetIndex])
    this.splicedPackets.splice(packetIndex, 1)
    this.packets.controls.splice(idx, 1)
    let temp = this.ornamentTypeData;
    this.ornamentTypeData = []
    for (let ornamnetsIndex = 0; ornamnetsIndex < this.splicedOrnaments.length; ornamnetsIndex++) {
      for (let ornamnetsIdIndex = 0; ornamnetsIdIndex < this.ornamentId.length; ornamnetsIdIndex++) {
        if (this.splicedOrnaments[ornamnetsIndex].id == this.ornamentId[ornamnetsIdIndex]) {
          temp.push(this.splicedOrnaments[ornamnetsIndex])
          this.splicedOrnaments.splice(ornamnetsIndex, 1)
          ornamnetsIdIndex = 0;
        }
      }
    }

    setTimeout(() => {
      this.ornamentTypeData = temp;
    }, 500)

  }

  clear() {
    this.sealingPacketWithWeight.nativeElement.value = '';
    this.emptyPacketWithNoOrnament.nativeElement.value = '';
    this.sealingPacketWithCustomer.nativeElement.value = '';
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
    let index = this.packetsDetails.findIndex(ele => {
      return ele.id == this.controls.packetId.value;
    })
    this.packetsName = this.packetsDetails[index].packetUniqueId
    this.splicedPackets.push(this.packetsDetails[index])
    this.packetsDetails.splice(index, 1)

    let ornamentTypeObject = this.controls.ornamentType.value.multiSelect
    this.ornamentName = ornamentTypeObject.map(e => e.name).toString();
    this.ornamentId = ornamentTypeObject.map(e => e.id)
    var selectedOrnaments = this.ornamentTypeData.filter((val) => {
      return ornamentTypeObject.indexOf(val) != -1;
    });

    var temp = this.ornamentTypeData
    this.ornamentTypeData = [];
    console.log(selectedOrnaments);
    selectedOrnaments.forEach(selectedornament => {
      var index = temp.findIndex(ornament => {
        return selectedornament.id == ornament.id
      })
      this.splicedOrnaments.push(temp[index])
      temp.splice(index, 1)
    })
    setTimeout(() => {

      this.ornamentTypeData = temp;
    }, 500)
    console.log(this.ornamentTypeData)
    this.clearData = true;


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
        this.packetService.uploadPackets(this.packetImg.value, this.masterAndLoanIds).pipe(
          map(res => {
            this.toast.success(res.message)
            this.url = 'view-loan'
            this.next.emit(7)
            // this.router.navigate(['/admin/loan-management/applied-loan'])
          }),
          catchError(err => {
            if (err.error.message && err.error.message == 'Packets has been already assign') {
              this.next.emit(7)
            }
            throw (err)
          })
        ).subscribe()
      }
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
    });
  }

  webcam(value, imageDataKey) {
    const dialogRef = this.dilaog.open(WebcamDialogComponent,
      {
        data: {},
        width: '500px'
      });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const params = {
          reason: 'loan',
          masterLoanId: this.masterAndLoanIds.masterLoanId
        }
        this.sharedService.uploadBase64File(res.imageAsDataUrl).subscribe(res => {
          console.log(res)
          this.packetImg.controls[value].patchValue(res.uploadFile.path)
          this.packetImg.controls[imageDataKey].patchValue(res.uploadFile.URL)
          this.ref.detectChanges()
        })
      }
    });
  }

}
