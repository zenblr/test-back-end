import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../core/shared/services/shared.service';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'kt-upload-packets',
  templateUrl: './upload-packets.component.html',
  styleUrls: ['./upload-packets.component.scss']
})
export class UploadPacketsComponent implements OnInit {

  left: number = 0;
  packets:any[] = []
  constructor(
    private sharedService:SharedService
  ) { }

  ngOnInit() {
    this.addmore()
  }


  addmore() {
    if (this.left < 90) {
      this.left = this.left + 15
      const left = (this.left).toString() + '%'
      const width = (document.querySelector('.addMore') as HTMLElement);
      width.style.left = left
    }
    let data ={
      noOrnaments:'',
      allOrnaments:'',
      sealing:'',
      weight:'',
    }
    this.packets.push(data)
  }

  uploadFile(index,value,event){
    this.sharedService.uploadFile(event.target.files[0]).pipe(
      map(res=>{
        this.packets[index][value] = res.uploadFile.URL
        console.log(this.packets)
      }),
      catchError(err =>{
        throw err
      })).subscribe()
  }
}
