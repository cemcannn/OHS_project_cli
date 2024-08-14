import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyDirectorateDataComponent } from './monthly-directorate-data.component';

describe('MonthlyDirectorateDataComponent', () => {
  let component: MonthlyDirectorateDataComponent;
  let fixture: ComponentFixture<MonthlyDirectorateDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyDirectorateDataComponent]
    });
    fixture = TestBed.createComponent(MonthlyDirectorateDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
