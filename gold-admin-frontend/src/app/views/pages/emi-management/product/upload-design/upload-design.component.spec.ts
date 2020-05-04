import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDesignComponent } from './upload-design.component';

describe('UploadDesignComponent', () => {
  let component: UploadDesignComponent;
  let fixture: ComponentFixture<UploadDesignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDesignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
