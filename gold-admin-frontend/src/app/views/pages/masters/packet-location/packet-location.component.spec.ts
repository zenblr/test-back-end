import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketLocationComponent } from './packet-location.component';

describe('PacketLocationComponent', () => {
  let component: PacketLocationComponent;
  let fixture: ComponentFixture<PacketLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
