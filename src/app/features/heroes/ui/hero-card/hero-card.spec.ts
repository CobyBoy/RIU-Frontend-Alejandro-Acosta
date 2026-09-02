import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroCard } from './hero-card';
import { HEROES_MOCK } from '../../testing/hero-list.mock';

describe('HeroCard', () => {
  let component: HeroCard;
  let fixture: ComponentFixture<HeroCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCard],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('hero', HEROES_MOCK[0]);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the hero id when edit is requested', () => {
    const emitSpy = vi.spyOn(component.editRequested, 'emit');

    component.onEdit();

    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(HEROES_MOCK[0].id);
  });

  it('should emit the hero when delete is requested', () => {
    const emitSpy = vi.spyOn(component.deleteRequested, 'emit');

    component.onDelete();

    expect(emitSpy).toHaveBeenCalledExactlyOnceWith(HEROES_MOCK[0]);
  });

  describe('ui', () => {
    it('should emit editRequested when edit button is clicked', () => {
      const emitSpy = vi.spyOn(component.editRequested, 'emit');

      const editButton = fixture.nativeElement.querySelector('[data-testid="edit-hero"]') as HTMLButtonElement;

      editButton.click();

      expect(emitSpy).toHaveBeenCalledExactlyOnceWith(HEROES_MOCK[0].id);
    });

    it('should emit deleteRequested when delete button is clicked', () => {
      const emitSpy = vi.spyOn(component.deleteRequested, 'emit');

      const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-hero"]') as HTMLButtonElement;

      deleteButton.click();

      expect(emitSpy).toHaveBeenCalledExactlyOnceWith(HEROES_MOCK[0]);
    });
  });
});
