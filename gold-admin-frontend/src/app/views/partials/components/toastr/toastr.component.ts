import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'kt-toastr',
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss']
})
export class ToastrComponent implements OnInit {

  constructor(private toastr: ToastrService) { }

  ngOnInit() {
  }

  successToastr(msg) {
    console.log(msg)
    this.toastr.success(msg, 'Successful!', { timeOut: 2000 });
  }

  errorToastr(msg) {
    this.toastr.error(msg, 'Error!', { timeOut: 3000 });
  }
}
