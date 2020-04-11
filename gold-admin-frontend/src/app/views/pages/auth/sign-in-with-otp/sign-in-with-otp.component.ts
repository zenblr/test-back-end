import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'kt-sign-in-with-otp',
  templateUrl: './sign-in-with-otp.component.html',
  styleUrls: ['./sign-in-with-otp.component.scss']
})
export class SignInWithOtpComponent implements OnInit {

  @ViewChild('one', { static: false }) one: ElementRef
  @ViewChild('two', { static: false }) two: ElementRef
  @ViewChild('three', { static: false }) three: ElementRef
  @ViewChild('four', { static: false }) four: ElementRef

  constructor(private fb: FormBuilder) { }

  singInOtp: FormGroup

  ngOnInit() {
    this.singInOtp = this.fb.group({
      one: ['', Validators.required],
      two: ['', Validators.required],
      three: ['', Validators.required],
      four: ['', Validators.required]
    })
  }
  input(event, ref: string) {
    console.log(event.target.value)
    if (event.target.value == "") {
      if (ref == 'four') {
        this.three.nativeElement.focus()
      }
      if (ref == 'two') {
        this.one.nativeElement.focus()
      }
      if (ref == 'three') {
        this.two.nativeElement.focus()
      }
    } else {
      if (ref == 'one') {
        this.two.nativeElement.focus()
      }
      if (ref == 'two') {
        this.three.nativeElement.focus()
      }
      if (ref == 'three') {
        this.four.nativeElement.focus()
      }
    }

  }


  submit() {
    if (this.singInOtp.invalid) {
      this.singInOtp.markAllAsTouched()
      this.one.nativeElement.focus()
      return
    }
    console.log(Number(Object.values(this.singInOtp.value).join("")))
  }

}
