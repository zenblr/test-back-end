import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
  ) {
    if (this.cookieService.get('errorObject')) {
      const errorObject = JSON.parse(this.cookieService.get('errorObject'))
      localStorage.setItem('error-object', JSON.stringify(errorObject));
      this.cookieService.deleteAll('/');
    }
  }

  ngOnInit() {
    if (this.route.snapshot.queryParams.m) {
      this.errorMessage = atob(this.route.snapshot.queryParams.m);
    }
    // this.errorMessage = JSON.parse(localStorage.getItem('error-object'));
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
