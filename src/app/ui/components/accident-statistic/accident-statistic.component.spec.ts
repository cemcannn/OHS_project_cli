import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentStatisticComponent } from './accident-statistic.component';

describe('AccidentStatisticComponent', () => {
  let component: AccidentStatisticComponent;
  let fixture: ComponentFixture<AccidentStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccidentStatisticComponent]
    });
    fixture = TestBed.createComponent(AccidentStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
