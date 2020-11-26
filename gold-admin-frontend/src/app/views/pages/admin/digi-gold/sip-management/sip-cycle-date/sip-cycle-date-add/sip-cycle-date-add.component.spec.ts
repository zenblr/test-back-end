import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SipCycleDateAddComponent } from './sip-cycle-date-add.component';

describe('SipCycleDateAddComponent', () => {
  let component: SipCycleDateAddComponent;
  let fixture: ComponentFixture<SipCycleDateAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SipCycleDateAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SipCycleDateAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
