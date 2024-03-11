import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentAddComponent } from './accident-add.component';

describe('AccidentAddDialogComponent', () => {
  let component: AccidentAddComponent;
  let fixture: ComponentFixture<AccidentAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccidentAddComponent]
    });
    fixture = TestBed.createComponent(AccidentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
