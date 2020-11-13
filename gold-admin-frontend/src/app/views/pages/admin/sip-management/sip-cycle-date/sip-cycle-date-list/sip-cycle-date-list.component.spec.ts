import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SipCycleDateListComponent } from './sip-cycle-date-list.component';

describe('SipCycleDateListComponent', () => {
  let component: SipCycleDateListComponent;
  let fixture: ComponentFixture<SipCycleDateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SipCycleDateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SipCycleDateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
