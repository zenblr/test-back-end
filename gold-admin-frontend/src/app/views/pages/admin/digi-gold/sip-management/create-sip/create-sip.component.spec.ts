import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSipComponent } from './create-sip.component';

describe('CreateSipComponent', () => {
  let component: CreateSipComponent;
  let fixture: ComponentFixture<CreateSipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
