import { Component, OnInit, AfterViewInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-nominee-details',
  templateUrl: './nominee-details.component.html',
  styleUrls: ['./nominee-details.component.scss']
})
export class NomineeDetailsComponent implements OnInit, AfterViewInit {

  nominee: FormGroup;
  showHide: boolean;
  @Input() disable
  @Output() nomineeEmit: EventEmitter<any> = new EventEmitter()
  @Input() invalid;



  constructor(
    public fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
  }

  ngOnChanges() {
    if (this.invalid) {
      this.nominee.markAllAsTouched()
      this.invalid = false
    }
    if(this.disable){
      this.nominee.disable()
    }
  }
  ngAfterViewInit() {
    this.nominee.valueChanges.subscribe(() => {
      this.nomineeEmit.emit({ nominee: this.nominee })
    })
  }

  initForm() {
    this.nominee = this.fb.group({
      nomineeName: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      nomineeAge: [, Validators.required],
      relationship: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      nomineeType: ["major"],
      guardianName: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      guardianAge: [, [Validators.required, Validators.pattern('^(?:1[01][0-9]|120|1[7-9]|[2-9][0-9])$')]],
      guardianRelationship: [, [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
    })
    this.checkForMinor()
    this.nomineeEmit.emit({ nominee: this.nominee })
  }

  checkForMinor() {
    console.log(this.controls.nomineeAge.value);
    if (this.controls.nomineeAge.value == null || this.controls.nomineeAge.value > 18) {
      this.showHide = false
      this.controls.nomineeType.patchValue("major")
      this.controls.guardianAge.disable();
      this.controls.guardianName.disable();
      this.controls.guardianRelationship.disable();
    }
    else if (this.controls.nomineeAge.value < 18) {
      this.showHide = true
      this.controls.guardianAge.enable();
      this.controls.guardianName.enable();
      this.controls.guardianRelationship.enable();
      this.controls.nomineeType.patchValue("minor")
    }

  }

  get controls() {
    return this.nominee.controls
  }

  scrollToOrnaments() {
    if (this.nominee.invalid) {
      this.nominee.markAllAsTouched();
      return;
    }
    this.nomineeEmit.emit({ nominee: this.nominee, scroll: true });
  }
}
