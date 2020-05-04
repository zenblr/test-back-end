import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletPriceComponent } from './wallet-price.component';

describe('WalletPriceComponent', () => {
  let component: WalletPriceComponent;
  let fixture: ComponentFixture<WalletPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
