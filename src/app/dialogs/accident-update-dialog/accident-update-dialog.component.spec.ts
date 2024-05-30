import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentUpdateDialogComponent } from './accident-update-dialog.component';

describe('AccidentUpdateDialogComponent', () => {
  let component: AccidentUpdateDialogComponent;
  let fixture: ComponentFixture<AccidentUpdateDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccidentUpdateDialogComponent]
    });
    fixture = TestBed.createComponent(AccidentUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
