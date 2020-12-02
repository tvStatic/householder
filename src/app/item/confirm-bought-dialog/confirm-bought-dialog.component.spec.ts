import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmBoughtDialogComponent } from './confirm-bought-dialog.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('ConfirmBoughtDialogComponent', () => {
  let component: ConfirmBoughtDialogComponent;
  let fixture: ComponentFixture<ConfirmBoughtDialogComponent>;
  const ngbActiveModalSpy = {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmBoughtDialogComponent],
      providers: [
        ConfirmBoughtDialogComponent,
        { provide: NgbActiveModal, useValue: ngbActiveModalSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmBoughtDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
