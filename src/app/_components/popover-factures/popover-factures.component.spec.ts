import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverFacturesComponent } from './popover-factures.component';

describe('PopoverFacturesComponent', () => {
  let component: PopoverFacturesComponent;
  let fixture: ComponentFixture<PopoverFacturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopoverFacturesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopoverFacturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
