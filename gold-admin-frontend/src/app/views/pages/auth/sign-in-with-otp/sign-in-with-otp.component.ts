import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth';
import { catchError, tap, finalize, takeUntil } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrComponent } from '../../../../views/partials/components';

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
  @ViewChild(ToastrComponent, { static: true }) toastr: ToastrComponent;


  loading = false;
  title: string;
  mobile: string;
  returnUrl: any;
  email: string;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute, ) {

    var referenceCode = localStorage.getItem('reference')

    if (this.router.url == '/auth/otp') {
      this.title = 'Enter OTP'

    } else if (this.router.url == '/auth/sign-in-otp') {
      this.title = 'Sign in with OTP'
    }
    if (!referenceCode) {
      this.router.navigate(['/auth/login'])
    }

  }

  singInOtp: FormGroup

  ngOnInit() {
    this.mobile = localStorage.getItem('mobile');


    this.route.queryParams.subscribe(params => {
      this.returnUrl = params.returnUrl || '/';
    });

    this.singInOtp = this.fb.group({
      one: ['', Validators.required],
      two: ['', Validators.required],
      three: ['', Validators.required],
      four: ['', Validators.required]
    })
  }


  input(event, ref: string) {
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

  reSend() {
    this.auth.generateOtp(this.mobile, 'login').pipe(
      tap(response => {
        if (response) {
          this.toastr.successToastr(response.message);
          localStorage.setItem('reference', btoa(response.referenceCode))
        }
      }),
      catchError(err => {
        this.toastr.errorToastr(err.error.message);
        throw err;
      }),
      finalize(() => {
        this.cdr.markForCheck();
      })
    ).subscribe();
  }


  submit() {
    if (this.singInOtp.invalid) {
      this.singInOtp.markAllAsTouched()
      this.one.nativeElement.focus()
      return
    }

    this.loading = true;
    var otp = Number(Object.values(this.singInOtp.value).join(""))
    var referenceCode = localStorage.getItem('reference')

    if (referenceCode && this.router.url == '/auth/otp') {

      this.auth.verifyotp(atob(referenceCode), otp, 'forget').pipe(
        tap(response => {
          this.router.navigate(['/auth/change-password'])
        }), catchError(err => {
          this.toastr.errorToastr(err.error.message);
          throw err;
        }), finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })).subscribe()
    }


    if (referenceCode && this.router.url == '/auth/sign-in-otp') {

      this.auth.signInWithOtp(atob(referenceCode), otp, 'login').pipe(
        tap(user => {
          // console.log(user);
          if (user) {
            console.log(user.token)
            // this.store.dispatch(new Login({ authToken: user.accessToken }));
            localStorage.removeItem('mobile')
            localStorage.removeItem('reference')
            localStorage.setItem('UserDetails', JSON.stringify(user));
            // debugger
            this.router.navigate(['/']);
            // if (this.returnUrl === '/') {
            //   this.router.navigate(['/admin/dashboard']);
            // } else {
            //   this.router.navigateByUrl(this.returnUrl); // Main page
            // }
            // this.router.navigateByUrl(this.returnUrl); // Main page
          }
          const msg = 'Successfully Logged In';
          this.toastr.successToastr(msg);

        }),
        catchError(err => {
          console.log(err)
          let showError = err.error.message;
          this.toastr.errorToastr(showError);
          throw err;

        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })).subscribe()
    }

  }



  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.loading = false;

  }

}
