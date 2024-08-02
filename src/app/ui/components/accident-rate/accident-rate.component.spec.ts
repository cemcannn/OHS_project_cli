import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentRateComponent } from './accident-rate.component';

describe('AccidentRateComponent', () => {
  let component: AccidentRateComponent;
  let fixture: ComponentFixture<AccidentRateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccidentRateComponent]
    });
    fixture = TestBed.createComponent(AccidentRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
