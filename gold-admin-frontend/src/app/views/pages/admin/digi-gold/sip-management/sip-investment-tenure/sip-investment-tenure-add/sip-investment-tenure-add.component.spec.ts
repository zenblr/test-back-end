import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SipInvestmentTenureAddComponent } from './sip-investment-tenure-add.component';

describe('SipInvestmentTenureAddComponent', () => {
  let component: SipInvestmentTenureAddComponent;
  let fixture: ComponentFixture<SipInvestmentTenureAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SipInvestmentTenureAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SipInvestmentTenureAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
