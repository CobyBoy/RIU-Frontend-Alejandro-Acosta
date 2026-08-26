import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HEROES_MOCK } from '../../testing/hero-list.mock';

describe('ConfirmDeleteDialog', () => {
  let component: ConfirmDeleteDialog;
  let fixture: ComponentFixture<ConfirmDeleteDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: HEROES_MOCK[0],
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero name', () => {
    expect(fixture.nativeElement.textContent).toContain(HEROES_MOCK[0].name);
  });
});
