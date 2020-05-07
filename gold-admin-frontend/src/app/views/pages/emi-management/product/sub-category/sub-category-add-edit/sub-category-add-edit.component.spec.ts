import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategoryAddEditComponent } from './sub-category-add-edit.component';

describe('SubCategoryAddEditComponent', () => {
  let component: SubCategoryAddEditComponent;
  let fixture: ComponentFixture<SubCategoryAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubCategoryAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubCategoryAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
