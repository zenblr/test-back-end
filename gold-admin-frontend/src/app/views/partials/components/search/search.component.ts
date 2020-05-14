import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { DataTableService } from '../../../../core/shared/services/data-table.service';
import { Router } from '@angular/router';

@Component({
  selector: 'kt-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;
  searchValue = '';

  constructor(
    private dataTableService: DataTableService,
    public router:Router
    ) {
    this.router.events.subscribe(() => {
			this.searchInput.nativeElement.value = ''
		})
   }

  ngOnInit() {
    const searchSubscription = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      debounceTime(1000), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
      distinctUntilChanged(), // This operator will eliminate duplicate values
      tap((res) => {
        this.searchValue = res['target']['value'];
        if (this.searchValue == undefined) {
          this.searchValue = '';
        }
        this.dataTableService.searchInput.next(this.searchValue);
      })
    )
      .subscribe();
    // this.subscriptions.push(searchSubscription);
  }

}
