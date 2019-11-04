import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestChatPage } from './test-chat.page';

describe('TestChatPage', () => {
  let component: TestChatPage;
  let fixture: ComponentFixture<TestChatPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestChatPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
