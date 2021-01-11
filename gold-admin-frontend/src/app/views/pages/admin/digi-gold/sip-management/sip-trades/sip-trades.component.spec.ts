import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SipTradesComponent } from './sip-trades.component';

describe('SipTradesComponent', () => {
  let component: SipTradesComponent;
  let fixture: ComponentFixture<SipTradesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SipTradesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SipTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
