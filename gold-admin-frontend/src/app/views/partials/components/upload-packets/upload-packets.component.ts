import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { SharedService } from '../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { PacketsService } from '../../../../core/loan-management';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { WebcamDialogComponent } from '../../../pages/admin/kyc-settings/webcam-dialog/webcam-dialog.component';
import { MatDialog } from '@angular/material';
import { ScrapPacketsService } from '../../../../core/scrap-management';

@Component({
  selector: 'kt-upload-packets',
  templateUrl: './upload-packets.component.html',
  styleUrls: ['./upload-packets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadPacketsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() viewpacketsDetails;
  @Input() viewScrapPacketsDetails;
  @Input() masterAndLoanIds;
  @Input() scrapIds
  @Input() loanStage
  @Input() scrapStage
  @Input() showButton
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
  buttonName: string;

  constructor(
    private sharedService: SharedService,
    private ele: ElementRef,
    public fb: FormBuilder,
    private packetService: PacketsService,
    private scrapPacketsService: ScrapPacketsService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private layoutUtilsService: LayoutUtilsService,
    private ref: ChangeDetectorRef,
    private dilaog: MatDialog
  ) {
    this.buttonName = 'save'
    this.url = this.router.url.split('/')[3]
    this.initForm()
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

  ngOnChanges(change: SimpleChanges) {
    if (change.ornamentType && change.ornamentType.currentValue) {
      this.ornamentTypeData = change.ornamentType.currentValue
      console.log(this.ornamentType)
      var temp = []
      // ornamentType.forEach(ele => {
      //   temp.push(ele.ornamentType)
      // });

      // this.ornamentTypeData = temp
      console.log(this.ornamentTypeData, 'zzz')
    }

    if (change.loanStage && change.loanStage.currentValue) {
      if (change.loanStage.currentValue.id != 3) {
        this.url = 'view-loan'
        this.buttonName = 'next'
      }
    }

    if (change.scrapStage && change.scrapStage.currentValue) {
      if (change.scrapStage.currentValue.id != 3) {
        this.url = 'view-scrap'
        this.buttonName = 'next'
      }
    }

    if (change.viewpacketsDetails && change.viewpacketsDetails.currentValue) {
      let packet = change.viewpacketsDetails.currentValue.loanPacketDetails[0]
      if (packet) {
        this.packetImg.patchValue(packet)
        console.log(packet.packets)
        packet.packets.forEach(ele => {

          this.packetsName = ele.packetUniqueId;
          this.controls.packetId.patchValue(ele.id)
          this.ornamentName = ele.customerLoanOrnamentsDetails.map(e => e.ornamentType.name).toString();
          this.ornamentId = ele.customerLoanOrnamentsDetails.map(e => e.id)

          let ornamentTypeArray = []
          ele.customerLoanOrnamentsDetails.forEach(ornamentType => {
            let data = { id: 0, name: '' }
            data.id = ornamentType.id;
            data.name = ornamentType.ornamentType.name
            ornamentTypeArray.push(data)
          })

          this.ornamentId = ele.customerLoanOrnamentsDetails.map(e => e.id)
          this.splicedPackets.push(ele)
          this.removeOnamentsDataFromMultiselect(ornamentTypeArray, 'edit')
          this.pushPackets()
        });

        console.log(this.ornamentTypeData)
        this.packetInfo.reset()
      }
    }

    if (change.viewScrapPacketsDetails && change.viewScrapPacketsDetails.currentValue) {
      let packet = change.viewScrapPacketsDetails.currentValue.scrapPacketDetails[0]
      if (packet) {
        this.packetImg.patchValue(packet)
        console.log(this.packetImg)
        console.log(packet.CustomerScrapPackageDetail)
        packet.CustomerScrapPackageDetail.forEach(ele => {
          this.packetsName = ele.packetUniqueId;
          this.controls.packetId.patchValue(ele.id)
          this.splicedPackets.push(ele)
          this.pushPackets()
        });
      }
    }

    if (this.scrapIds) {
      this.validation();
    }
  }

  ngOnInit() {
    if (this.scrapIds) {
      this.getScrapPacketsDetails();
    } else {
      this.getPacketsDetails();
    }
  }

  initForm() {
    this.packetInfo = this.fb.group({
      ornamentType: [null, Validators.required],
      packetId: [null, Validators.required],
    })
  }

  validation() {
    if (this.scrapIds) {
      this.packetInfo.controls.ornamentType.setValidators([]),
        this.packetInfo.controls.ornamentType.updateValueAndValidity()
    }
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
        this.ref.detectChanges()
      })
    ).subscribe()
  }

  getScrapPacketsDetails() {
    this.scrapPacketsService.getScrapPacketsAvailable().pipe(
      map(res => {
        this.packetsDetails = res.data;
        this.ref.detectChanges();
      })
    ).subscribe();
  }

  ngAfterViewInit() { }

  addmore() {
    if (this.packetInfo.invalid) {
      this.packetInfo.markAllAsTouched();
      return;
    }

    if (this.url != 'view-loan' && this.url != 'view-scrap') {
      this.removePackets()
    }

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

    let ornamentId = this.packets.controls[idx].value.ornamentsId
    this.packetsDetails.push(this.splicedPackets[packetIndex])
    this.splicedPackets.splice(packetIndex, 1)
    this.packets.controls.splice(idx, 1)
    
    if (!this.scrapIds) {
      let temp = this.ornamentTypeData;
      this.ornamentTypeData = []
      for (let ornamnetsIdIndex = 0; ornamnetsIdIndex < ornamentId.length; ornamnetsIdIndex++) {
        for (let ornamnetsIndex = 0; ornamnetsIndex < this.splicedOrnaments.length; ornamnetsIndex++) {
          console.log(this.splicedOrnaments[ornamnetsIndex].id == ornamentId[ornamnetsIdIndex])
          if (this.splicedOrnaments[ornamnetsIndex].id == ornamentId[ornamnetsIdIndex]) {
            temp.push(this.splicedOrnaments[ornamnetsIndex])
            this.splicedOrnaments.splice(ornamnetsIndex, 1)
            // this.ornamentId.splice(ornamnetsIdIndex, 1)
            // ornamnetsIndex = 0;
          }
        }
      }

      setTimeout(() => {
        console.log(temp)
        this.ornamentTypeData = temp;
        this.ref.detectChanges()
      }, 200)
    }

    if (this.packets.length === 0) {
      this.packetImg.reset()
    }
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

    if (!this.scrapIds) {
      let ornamentTypeObject = this.controls.ornamentType.value.multiSelect
      this.ornamentName = ornamentTypeObject.map(e => e.ornamentType).toString();
      this.ornamentId = ornamentTypeObject.map(e => e.id)

      this.removeOnamentsDataFromMultiselect(ornamentTypeObject, 'add')

    }

    this.clearData = true;
  }

  removeOnamentsDataFromMultiselect(ornamentTypeObject, action) {
    var selectedOrnaments = []

    this.ornamentTypeData.forEach((val) => {
      let temp = []
      ornamentTypeObject.forEach(element => {
        if (element.id == val.id) {
          temp.push(val)
        }
      });
      Array.prototype.push.apply(selectedOrnaments, temp)
    });

    var temp = this.ornamentTypeData
    this.ornamentTypeData = [];

    selectedOrnaments.forEach(selectedornament => {
      var index = temp.findIndex(ornament => {
        return selectedornament.id == ornament.id
      })
      this.splicedOrnaments.push(temp[index])
      temp.splice(index, 1)
    })

    if (action == 'edit') {

      this.ornamentTypeData = temp;

    } else if (action == 'add') {

      setTimeout(() => {
        this.ornamentTypeData = temp;
        this.ref.detectChanges()
      }, 500)

    }
    console.log(this.ornamentTypeData)
  }

  save() {

    if (this.url == 'view-loan' || this.url == 'view-scrap') {
      this.next.emit(6)
      return
    }

    if (this.packetImg.invalid) {
      this.packetImg.markAllAsTouched()
      return
    }
    const _title = 'Save Packet';
    const _description = 'Are you sure, you want to save packets?';
    const _waitDesciption = 'Packet is saving...';
    const _deleteMessage = `Packet has been saved`;
    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if (this.scrapIds) {
          this.scrapPacketsService.uploadPackets(this.packetImg.value, this.scrapIds).pipe(
            map(res => {
              this.toast.success(res.message);
              this.router.navigate(['/admin/scrap-management/applied-scrap']);
            }),
            catchError(err => {
              if (err.error.message && err.error.message == 'Packets has been already assign') {
                this.next.emit(7);
              }
              throw (err);
            })
          ).subscribe();
        } else {
          this.packetService.uploadPackets(this.packetImg.value, this.masterAndLoanIds).pipe(
            map(res => {
              this.toast.success(res.message)
              // this.url = 'view-loan'
              // this.next.emit(7)
              this.router.navigate(['/admin/loan-management/applied-loan'])
            }),
            catchError(err => {
              if (err.error.message && err.error.message == 'Packets has been already assign') {
                this.next.emit(7)
              }
              throw (err)
            })
          ).subscribe()
        }
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
        let params;
        if (this.scrapIds) {
          params = {
            reason: 'scrap',
            scrapId: this.scrapIds.scrapId
          }
        } else {
          params = {
            reason: 'loan',
            masterLoanId: this.masterAndLoanIds.masterLoanId
          }
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
