import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, AfterViewInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ImagePreviewDialogComponent } from '../../../../../../views/partials/components/image-preview-dialog/image-preview-dialog.component';


@Component({
  selector: 'kt-ornaments',
  templateUrl: './ornaments.component.html',
  styleUrls: ['./ornaments.component.scss']
})
export class OrnamentsComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() invalid;
  @Input() disable
  @Output() OrnamentsDataEmit: EventEmitter<any> = new EventEmitter()
  left: number = 150
  width: number = 0
  ornamentsForm: FormGroup;
  images: any = [];
  karatArr = [{ value: 18, name: '18 K' },
  { value: 19, name: '19 K' },
  { value: 20, name: '20 K' },
  { value: 21, name: '21 K' },
  { value: 22, name: '22 K' }]
  purityBasedDeduction: number;
  ltvPercent = [];

  constructor(
    public fb: FormBuilder,
    public sharedService: SharedService,
    public toast: ToastrService,
    public ele: ElementRef,
    public dilaog: MatDialog,
    public ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.ornamentsForm = this.fb.group({
      ornamentData: this.fb.array([])
    })
    this.addmore();
    this.OrnamentsDataEmit.emit(this.OrnamentsData)

  }

  ngOnChanges() {
    if (this.disable) {
      this.ornamentsForm.disable()
    }
  }

  ngAfterViewInit() {
    this.OrnamentsData.valueChanges.subscribe(() => {
      this.OrnamentsDataEmit.emit(this.OrnamentsData)
    })
  }
  get OrnamentsData() {
    if (this.ornamentsForm)
      return this.ornamentsForm.controls.ornamentData as FormArray;
  }


  addmore() {
    if (this.left < 900) {
      this.width = this.width + 130
      if (this.width > 130)
        this.left = this.left + 130
      const left = (this.left).toString() + 'px'
      const width = (this.ele.nativeElement.querySelector('.mat-tab-header') as HTMLElement);
      const addmore = (this.ele.nativeElement.querySelector('.addmore') as HTMLElement);
      width.style.maxWidth = left
      addmore.style.left = left

    }
    this.OrnamentsData.push(this.fb.group({
      ornamentType: [],
      quantity: [],
      grossWeight: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      netWeight: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      deductionWeight: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      ornamentImage: [],
      weightMachineZeroWeight: [],
      withOrnamentWeight: [],
      stoneTouch: [],
      acidTest: [],
      karat: [],
      purity: [],
      ltvRange: [[]],
      purityTest: [[]],
      ltvPercent: [, [Validators.required, Validators.pattern('(?<![\\d.])(\\d{1,2}|\\d{0,2}\\.\\d{1,2})?(?![\\d.])|(100)')]],
      ltvAmount: [, [Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      currentLtvAmount: []
    }))
    console.log(this.OrnamentsData.controls)
  }

  selectKarat(index) {
    const controls = this.OrnamentsData.at(index) as FormGroup;;
    console.log(controls.controls.karat.value);
    switch (controls.controls.karat.value) {
      case '18':
        this.ltvPercent = ['75', '76', '77', '78', '79'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 7.5;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '19':
        this.ltvPercent = ['80', '81', '82', '83', '84'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 5;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '20':
        this.ltvPercent = ['85', '86', '87', '88', '89'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 2;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '21':
        this.ltvPercent = ['90', '91', '92', '93', '94'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 1.5;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      case '22':
        this.ltvPercent = ['95', '96', '97', '98', '99', '100'];
        controls.controls.ltvRange.patchValue(this.ltvPercent)
        this.purityBasedDeduction = 1;
        controls.controls.purity.patchValue(this.purityBasedDeduction);
        break;
      default:
        break;
    }
    this.ref.detectChanges()
    console.log(this.ltvPercent)
  }

  uploadFile(index, event, string, ) {
    this.sharedService.uploadFile(event.target.files[0]).pipe(
      map(res => {
        this.patchUrlIntoForm(string, res.uploadFile.URL, index)
      }),
      catchError(err => {
        this.toast.error(err.error)
        throw err
      })).subscribe();
  }

  patchUrlIntoForm(key, url, index) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeight':
        controls.controls.withOrnamentWeight.patchValue(url)
        break;
      case 'acidTest':
        controls.controls.acidTest.patchValue(url)
        break;
      case 'vm':
        controls.controls.weightMachineZeroWeight.patchValue(url)
        break;
      case 'stoneTouch':
        controls.controls.stoneTouch.patchValue(url)
        break;
      case 'purity':
        let temp = []
        if (controls.controls.purityTest.value.length > 0)
          temp = controls.controls.purityTest.value
        temp.push(url)
        controls.controls.purityTest.patchValue(temp)
        break;

      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(url)
        break;
    }
    let data = { index: index, url: url }
    this.images.push(data)

  }

  removeImage(key, index, value) {
    const controls = this.OrnamentsData.at(index) as FormGroup;
    switch (key) {
      case 'withOrnamentWeight':
        controls.controls.withOrnamentWeight.patchValue(null)
        break;
      case 'acidTest':
        controls.controls.acidTest.patchValue(null)
        break;
      case 'vm':
        controls.controls.weightMachineZeroWeight.patchValue(null)
        break;
      case 'stoneTouch':
        controls.controls.stoneTouch.patchValue(null)
        break;
      case 'purity':
        controls.controls.purityTest.patchValue(null)
        break;
      case 'ornamentImage':
        controls.controls.ornamentImage.patchValue(null)
        break;
    }
    var idx = this.images[index].indexOf(value)
    this.images[index].splice(idx, 1)
  }

  preview(value, formIndex) {
    let filterImage = []
    this.images.forEach(img => {
      if (img.index === formIndex)
        filterImage.push(img.url)
    })
    let img = Object.values(filterImage)
    let index = img.indexOf(value)
    this.dilaog.open(ImagePreviewDialogComponent, {
      data: {
        images: img,
        index: index
      },
      width: "auto"
    })
  }
}
