import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnelUpdateDialogComponent } from './personnel-update-dialog.component';

describe('PersonnelUpdateDialogComponent', () => {
  let component: PersonnelUpdateDialogComponent;
  let fixture: ComponentFixture<PersonnelUpdateDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonnelUpdateDialogComponent]
    });
    fixture = TestBed.createComponent(PersonnelUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
