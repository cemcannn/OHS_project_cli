import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentListComponent } from './accident-list.component';

describe('AccidentListComponent', () => {
  let component: AccidentListComponent;
  let fixture: ComponentFixture<AccidentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccidentListComponent]
    });
    fixture = TestBed.createComponent(AccidentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
