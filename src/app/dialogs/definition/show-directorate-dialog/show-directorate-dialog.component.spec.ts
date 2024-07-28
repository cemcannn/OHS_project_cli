import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDirectorateDialogComponent } from './show-directorate-dialog.component';

describe('ShowDirectorateDialogComponent', () => {
  let component: ShowDirectorateDialogComponent;
  let fixture: ComponentFixture<ShowDirectorateDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowDirectorateDialogComponent]
    });
    fixture = TestBed.createComponent(ShowDirectorateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
