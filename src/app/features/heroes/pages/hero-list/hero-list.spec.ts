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
  const searchByNameMock = vi.fn();

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

    searchByNameMock.mockReset();
    searchByNameMock.mockReturnValue(heroesSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [HeroList],
      providers: [
        provideRouter([]),
        {
          provide: HeroService,
          useValue: {
            getAllHeroes: getAllHeroesMock,
            delete: deleteMock,
            searchByName: searchByNameMock,
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

      const callsBeforeDelete = getAllHeroesMock.mock.calls.length;

      component.onDeleteRequested(hero);
      dialogResultSubject.next(true);

      deleteSubject.next();
      deleteSubject.complete();

      fixture.detectChanges();

      expect(getAllHeroesMock).toHaveBeenCalledTimes(callsBeforeDelete + 1);
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

  describe('search', () => {
    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should search heroes after the debounce time', async () => {
      vi.useFakeTimers();

      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;

      input.value = 'man';
      input.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(searchByNameMock).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(300);
      expect(searchByNameMock).toHaveBeenCalledExactlyOnceWith('man');

      vi.useRealTimers();
    });

    it('should debounce search changes', async () => {
      vi.useFakeTimers();

      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;

      input.value = 'm';
      input.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(100);

      input.value = 'ma';
      input.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(100);

      input.value = 'man';
      input.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(299);

      expect(searchByNameMock).not.toHaveBeenCalledOnce();
      await vi.advanceTimersByTimeAsync(1);
      expect(searchByNameMock).toHaveBeenCalledExactlyOnceWith('man');
    });

    it('should trim the search query', async () => {
      vi.useFakeTimers();

      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;

      input.value = '  man  ';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      expect(searchByNameMock).toHaveBeenCalledExactlyOnceWith('man');
    });

    it('should reload all heroes after search is cleared', async () => {
      vi.useFakeTimers();

      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;

      input.value = '  man  ';
      input.dispatchEvent(new Event('input'));

      await vi.advanceTimersByTimeAsync(300);

      expect(searchByNameMock).toHaveBeenCalledExactlyOnceWith('man');
    });

    it('should reset the current page when searching', () => {
      component.page.set(2);

      const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;

      input.value = 'man';
      input.dispatchEvent(new Event('input'));

      expect(component.page()).toBe(0);
    });
  });

  describe('pagination', () => {
    it('should paginate heroes', () => {
      heroesSubject.next(HEROES_MOCK);
      fixture.detectChanges();

      expect(component.pagedHeroes()).toEqual(HEROES_MOCK.slice(0, 5));

      component.page.set(1);

      expect(component.pagedHeroes()).toEqual(HEROES_MOCK.slice(5, 10));
    });

    it('should update the current page', () => {
      component.onPageChange({
        pageIndex: 1,
        previousPageIndex: 0,
        pageSize: 5,
        length: 10,
      });

      expect(component.page()).toBe(1);
      expect(component.pageSize()).toBe(5);
    });

    it('should update the page size', () => {
      component.onPageChange({
        pageIndex: 0,
        previousPageIndex: 1,
        pageSize: 10,
        length: 10,
      });

      expect(component.page()).toBe(0);
      expect(component.pageSize()).toBe(10);
    });

    it('should reset the page after deleting successfully', () => {
      const hero = HEROES_MOCK[0];
      const deleteSubject = new Subject<void>();

      deleteMock.mockReturnValue(deleteSubject.asObservable());

      component.page.set(1);

      component.onDeleteRequested(hero);
      dialogResultSubject.next(true);

      deleteSubject.next();
      deleteSubject.complete();

      expect(component.page()).toBe(0);
    });
  });
});
