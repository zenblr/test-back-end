import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { PacketsService } from '../../../../../../core/loan-management';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-upload-packets',
  templateUrl: './upload-packets.component.html',
  styleUrls: ['./upload-packets.component.scss']
})
export class UploadPacketsComponent implements OnInit, AfterViewInit {

  @Input() viewpacketsDetails;
  @ViewChild('emptyPacketWithNoOrnament', { static: false }) emptyPacketWithNoOrnament: ElementRef
  @ViewChild('packetWithAllOrnaments', { static: false }) packetWithAllOrnaments: ElementRef
  @ViewChild('packetWithSealing', { static: false }) packetWithSealing: ElementRef
  @ViewChild('packetWithWeight', { static: false }) packetWithWeight: ElementRef
  packetsForm: FormGroup;
  left: number = 0
  width: number = 0
  packetsDetais: any[] = []
  packetId = new FormControl('', Validators.required);
  loanId: number = 0;
  packetsName: any;
  url: string;
  constructor(
    private sharedService: SharedService,
    private ele: ElementRef,
    public fb: FormBuilder,
    private packetService: PacketsService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.url = this.router.url.split('/')[2]
    this.loanId = this.route.snapshot.params.id
    this.getPacketsDetails()
    this.packetsForm = this.fb.group({
      packetsArray: this.fb.array([])
    })
    if (this.viewpacketsDetails) {
      const array = this.viewpacketsDetails.loanPacketDetails
      for (let index = 0; index < array.length; index++) {
        this.packetId.patchValue(array[index].packetId)
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
  get packets() {
    if (this.packetsForm) {
      return this.packetsForm.controls.packetsArray as FormArray
    }
  }

  getPacketsDetails() {
    this.packetService.getPacketsAvailable().pipe(
      map(res => {
        this.packetsDetais = res.data
      })
    ).subscribe()
  }

  ngAfterViewInit() {
  }

  addmore() {
    if (this.packetId.invalid) {
      this.packetId.markAsTouched();
      return;
    }
    if (this.left < 650) {
      this.width = this.width + 130

      if (this.left == 0)
        this.left = this.left + 150
      else if (this.left > 0)
        this.left = this.left + 130

      const left = (this.left).toString() + 'px'
      const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
      const addmore = (this.ele.nativeElement.querySelector('.addMore') as HTMLElement);
      width.style.maxWidth = left
      addmore.style.left = left

    } else {
      const addmore = (this.ele.nativeElement.querySelector('.addMore') as HTMLElement);
      addmore.style.left = '750px'
      const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
      width.style.maxWidth = '720px'

    }
    if (this.url != 'view-loan')
      this.removePackets()

    this.packets.push(this.fb.group({
      emptyPacketWithNoOrnament: ['', Validators.required],
      packetWithAllOrnaments: ['', Validators.required],
      packetWithSealing: ['', Validators.required],
      packetWithWeight: ['', Validators.required],
      packetId: [this.packetId.value],
      packetsName: [this.packetsName]
    }))
    this.packetId.patchValue('')
    this.packetId.reset()


  }

  removeOrnaments(idx) {
    
    if (this.left > 150) {
      this.width = (this.packets.length * 130) - 130
      if (this.width >= 130 && this.width < 910) {
        this.left = this.left - 130
      }
      const left = (this.left).toString() + 'px'
      const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
      width.style.maxWidth = left
      const addmore = (this.ele.nativeElement.querySelector('.addmore') as HTMLElement);
      addmore.style.left = left

    }
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
          const packet = this.packets.at(index) as FormArray
          packet.controls[value].patchValue(res.uploadFile.URL)
          console.log(this.packets.value)
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
    let index = this.packetsDetais.findIndex(ele => {
      return ele.id == this.packetId.value;
    })
    this.packetsName = this.packetsDetais[index].packetUniqueId
    console.log(this.packetId.value)

    this.packetsDetais.splice(index, 1)
  }

  save() {
    if (this.packetsForm.invalid) {
      this.packetsForm.markAllAsTouched()
      return
    }
    this.packetService.uploadPackets(this.packets.value, this.loanId).pipe(
      map(res => {
        this.toast.success(res.message)
        this.router.navigate(['/admin/loan-management/applied-loan'])
      })
    ).subscribe()
  }
}