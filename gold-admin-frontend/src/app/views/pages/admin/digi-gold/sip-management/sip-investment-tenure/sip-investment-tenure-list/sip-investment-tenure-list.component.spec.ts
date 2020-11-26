import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SipInvestmentTenureListComponent } from './sip-investment-tenure-list.component';

describe('SipInvestmentTenureListComponent', () => {
  let component: SipInvestmentTenureListComponent;
  let fixture: ComponentFixture<SipInvestmentTenureListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SipInvestmentTenureListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SipInvestmentTenureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
