import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroList } from './hero-list';
import { Subject } from 'rxjs';
import { Hero } from '../../models/hero.model';
import { HeroService } from '../../services/hero.service';
import { HEROES_MOCK } from '../../testing/hero-list.mock';
import { HeroCardStub } from '../../testing/hero-card.stub';
import { HeroCard } from '../../ui/hero-card/hero-card';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialog } from '../../ui/confirm-delete-dialog/confirm-delete-dialog';

describe('HeroList', () => {
  let component: HeroList;
  let fixture: ComponentFixture<HeroList>;
  let heroesSubject: Subject<Hero[]>;
  let dialogResultSubject: Subject<boolean | undefined>;
  let deleteSubject: Subject<void>;

  const deleteMock = vi.fn();
  const openDialogMock = vi.fn();
  const getAllHeroesMock = vi.fn();

  beforeEach(async () => {
    heroesSubject = new Subject<Hero[]>();
    dialogResultSubject = new Subject<boolean | undefined>();
    deleteSubject = new Subject<void>();

    deleteMock.mockReset();
    openDialogMock.mockReset();

    openDialogMock.mockReturnValue({
      afterClosed: () => dialogResultSubject.asObservable(),
    });

    getAllHeroesMock.mockReset();
    getAllHeroesMock.mockReturnValue(heroesSubject.asObservable());
    deleteMock.mockReturnValue(deleteSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [HeroList],
      providers: [
        provideRouter([]),
        {
          provide: HeroService,
          useValue: {
            getAllHeroes: getAllHeroesMock,
            delete: deleteMock,
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: openDialogMock,
          },
        },
      ],
    })
      .overrideComponent(HeroList, {
        remove: {
          imports: [HeroCard],
        },
        add: {
          imports: [HeroCardStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeroList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading while heroes are being loaded', () => {
    expect(fixture.nativeElement.textContent).toContain('Cargando heroes...');
  });

  it('should render the returned heroes', () => {
    heroesSubject.next(HEROES_MOCK);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('3 heroes encontrados.');
    expect(text).toContain('Spider-Man');
    expect(text).toContain('Captain Marvel');
    expect(text).toContain('Iron Man');
  });

  it('should show an empty state when no heroes are returned', () => {
    heroesSubject.next([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se encontraron heroes.');
  });

  it('should show an error when loading heroes fails', () => {
    heroesSubject.error(new Error('API error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los heroes.');
  });

  describe('delete dialog', () => {
    it('should open the delete confirmation dialog', () => {
      const hero = HEROES_MOCK[0];

      component.onDeleteRequested(hero);

      expect(openDialogMock).toHaveBeenCalledExactlyOnceWith(ConfirmDeleteDialog, {
        data: hero,
      });
    });

    it('should not delete when confirmation is cancelled', () => {
      const hero = HEROES_MOCK[0];

      component.onDeleteRequested(hero);

      dialogResultSubject.next(false);
      dialogResultSubject.complete();

      expect(deleteMock).not.toHaveBeenCalled();
    });

    it('should not delete the hero when the dialog is dismissed', () => {
      component.onDeleteRequested(HEROES_MOCK[0]);

      dialogResultSubject.next(undefined);
      dialogResultSubject.complete();

      expect(deleteMock).not.toHaveBeenCalled();
    });

    it('should delete the hero when confirmed', () => {
      const hero = HEROES_MOCK[0];
      const deleteSubject = new Subject<void>();

      deleteMock.mockReturnValue(deleteSubject.asObservable());

      component.onDeleteRequested(hero);

      dialogResultSubject.next(true);

      expect(deleteMock).toHaveBeenCalledExactlyOnceWith(hero.id);
      expect(component.deleting()).toBe(true);

      deleteSubject.next();
      deleteSubject.complete();

      expect(component.deleting()).toBe(false);
    });

    it('should set deleting while the delete request is pending', () => {
      component.onDeleteRequested(HEROES_MOCK[0]);

      dialogResultSubject.next(true);

      expect(component.deleting()).toBe(true);

      deleteSubject.next();
      deleteSubject.complete();

      expect(component.deleting()).toBe(false);
    });

    it('should reload heroes after deleting successfully', () => {
      const hero = HEROES_MOCK[0];
      const deleteSubject = new Subject<void>();

      deleteMock.mockReturnValue(deleteSubject.asObservable());

      component.onDeleteRequested(hero);
      dialogResultSubject.next(true);

      deleteSubject.next();
      deleteSubject.complete();

      fixture.detectChanges();

      expect(getAllHeroesMock).toHaveBeenCalledTimes(2);
    });

    it('should show an error when delete fails', () => {
      const hero = HEROES_MOCK[0];
      const deleteSubject = new Subject<void>();

      deleteMock.mockReturnValue(deleteSubject.asObservable());

      component.onDeleteRequested(hero);
      dialogResultSubject.next(true);

      deleteSubject.error(new Error('Delete failed'));

      fixture.detectChanges();

      expect(component.deleting()).toBe(false);
      expect(component.deleteError()).toBe('No se pudo eliminar el heroe.');

      expect(fixture.nativeElement.textContent).toContain('No se pudo eliminar el heroe.');
    });

    it('should clear a previous delete error before retrying', () => {
      component.onDeleteRequested(HEROES_MOCK[0]);
      dialogResultSubject.next(true);
      deleteSubject.error(new Error('Delete failed'));

      expect(component.deleteError()).not.toBeNull();

      dialogResultSubject = new Subject<boolean | undefined>();
      deleteSubject = new Subject<void>();

      openDialogMock.mockReturnValue({
        afterClosed: () => dialogResultSubject.asObservable(),
      });

      deleteMock.mockReturnValue(deleteSubject.asObservable());

      component.onDeleteRequested(HEROES_MOCK[0]);
      dialogResultSubject.next(true);

      expect(component.deleteError()).toBeNull();
    });
  });
});
