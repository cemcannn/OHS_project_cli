import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnelAddDialogComponent } from './personnel-add-dialog.component';

describe('PersonnelAddDialogComponent', () => {
  let component: PersonnelAddDialogComponent;
  let fixture: ComponentFixture<PersonnelAddDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonnelAddDialogComponent]
    });
    fixture = TestBed.createComponent(PersonnelAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
