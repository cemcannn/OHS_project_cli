import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentComponent } from './accident.component';

describe('AccidentComponent', () => {
  let component: AccidentComponent;
  let fixture: ComponentFixture<AccidentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccidentComponent]
    });
    fixture = TestBed.createComponent(AccidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
