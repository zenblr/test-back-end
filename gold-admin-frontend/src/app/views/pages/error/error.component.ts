import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'kt-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  errorMessage: any;

  constructor(
    private router: Router,
    private cookieService: CookieService,
  ) {
    if (this.cookieService.get('errorObject')) {
      console.log(this.cookieService.get('errorObject'))
      console.log(JSON.parse(this.cookieService.get('errorObject')))
      const errorObject = JSON.parse(this.cookieService.get('errorObject'))
      localStorage.setItem('error-object', JSON.stringify(errorObject));
      this.cookieService.deleteAll('/');
    }
  }

  ngOnInit() {
    this.errorMessage = JSON.parse(localStorage.getItem('error-object'));
    console.log(this.errorMessage)
    // if (!this.errorMessage) {
    //   this.router.navigate(['/']);
    //   return;
    // }
  }

  redirectToHome() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    localStorage.removeItem('error-object');
  }
}
