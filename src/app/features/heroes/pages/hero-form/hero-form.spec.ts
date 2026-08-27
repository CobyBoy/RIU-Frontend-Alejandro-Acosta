import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroForm } from './hero-form';
import { signal } from '@angular/core';
import { HeroFormFacade } from '../../services/hero-form.facade';
import { Hero } from '../../models/hero.model';

describe('HeroForm', () => {
  let component: HeroForm;
  let fixture: ComponentFixture<HeroForm>;

  const createMock = vi.fn();
  const cancelMock = vi.fn();
  const updateMock = vi.fn();
  const loadMock = vi.fn();

  const facadeMock = {
    hero: signal<Hero | null>(null),
    loading: signal(false),
    submitting: signal(false),
    error: signal<string | null>(null),
    create: createMock,
    cancel: cancelMock,
    update: updateMock,
    load: loadMock,
  };

  beforeEach(async () => {
    createMock.mockReset();
    cancelMock.mockReset();
    updateMock.mockReset();
    loadMock.mockReset();
    facadeMock.submitting.set(false);
    facadeMock.error.set(null);
    facadeMock.hero.set(null);
    facadeMock.loading.set(false);

    await TestBed.configureTestingModule({
      imports: [HeroForm],
    })
      .overrideComponent(HeroForm, {
        remove: {
          providers: [HeroFormFacade],
        },
        add: {
          providers: [
            {
              provide: HeroFormFacade,
              useValue: facadeMock,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeroForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cancel through the facade', () => {
    facadeMock.submitting.set(true);
    component.onCancel();

    expect(cancelMock).toHaveBeenCalledOnce();
  });

  it('should use the mocked facade', () => {
    expect(component.facade).toBe(facadeMock);
  });

  describe('form', () => {
    it('should start with an empty form', () => {
      expect(component.form.value).toEqual({
        name: '',
        realName: '',
        imageUrl: '',
        link: '',
      });
    });

    it('should require name and real name', () => {
      component.form.controls.name.markAsTouched();
      component.form.controls.realName.markAsTouched();

      expect(component.form.controls.name.hasError('required')).toBe(true);
      expect(component.form.controls.realName.hasError('required')).toBe(true);
      expect(component.form.invalid).toBe(true);
    });

    it('should require a minimum length of three characters', () => {
      component.form.controls.name.setValue('A');
      component.form.controls.realName.setValue('B');

      expect(component.form.controls.name.hasError('minlength')).toBe(true);
      expect(component.form.controls.realName.hasError('minlength')).toBe(true);
      expect(component.form.invalid).toBe(true);
    });

    it('should not create a hero when the form is invalid', () => {
      component.onSubmit();

      expect(createMock).not.toHaveBeenCalled();
      expect(component.form.controls.name.touched).toBe(true);
      expect(component.form.controls.realName.touched).toBe(true);
    });
  });

  describe('create mode', () => {
    it('should not load a hero in create mode', () => {
      expect(loadMock).not.toHaveBeenCalled();
    });

    it('should create a hero when the form is valid', () => {
      component.form.setValue({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: 'https://example.com/spider-man.jpg',
        link: 'https://example.com/spider-man',
      });

      component.onSubmit();

      expect(createMock).toHaveBeenCalledExactlyOnceWith({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: 'https://example.com/spider-man.jpg',
        link: 'https://example.com/spider-man',
      });
    });

    it('should omit an empty optional link when creating a hero', () => {
      component.form.setValue({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: 'https://example.com/spider-man.jpg',
        link: '',
      });

      component.onSubmit();

      expect(createMock).toHaveBeenCalledExactlyOnceWith({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: 'https://example.com/spider-man.jpg',
        link: '',
      });
    });

    it('should omit an optional link containing only whitespace', () => {
      component.form.setValue({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: 'https://example.com/spider-man.jpg',
        link: '   ',
      });

      component.onSubmit();

      expect(createMock).toHaveBeenCalledExactlyOnceWith({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: 'https://example.com/spider-man.jpg',
        link: '',
      });
    });

    it('should trim form values before creating a hero', () => {
      component.form.setValue({
        name: '  Spider-Man  ',
        realName: '  Peter Parker  ',
        imageUrl: '  https://example.com/spider-man.jpg  ',
        link: '  https://example.com/spider-man  ',
      });

      component.onSubmit();

      expect(createMock).toHaveBeenCalledExactlyOnceWith({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: 'https://example.com/spider-man.jpg',
        link: 'https://example.com/spider-man',
      });
    });
  });

  describe('edit mode', () => {
    it('should load the hero in edit mode', () => {
      fixture.componentRef.setInput('id', '1');
      fixture.detectChanges();

      expect(loadMock).toHaveBeenCalledExactlyOnceWith('1');
    });

    it('should populate the form when a hero is loaded in edit mode', () => {
      facadeMock.hero.set({
        id: '1',
        name: 'Spider-Man',
        realName: 'Peter Benjamin Parker',
        imageUrl: '/images/spider-man.jpg',
        link: 'https://example.com/spider-man',
      });

      fixture.detectChanges();

      expect(component.form.value).toEqual({
        name: 'Spider-Man',
        realName: 'Peter Benjamin Parker',
        imageUrl: '/images/spider-man.jpg',
        link: 'https://example.com/spider-man',
      });
    });

    it('should use an empty link when the loaded hero has no link', () => {
      facadeMock.hero.set({
        id: '1',
        name: 'Spider-Man',
        realName: 'Peter Benjamin Parker',
        imageUrl: '/images/spider-man.jpg',
      });

      fixture.detectChanges();

      expect(component.form.controls.link.value).toBe('');
    });

    it('should update the hero when submitting in edit mode', () => {
      fixture.componentRef.setInput('id', '1');
      fixture.detectChanges();

      component.form.setValue({
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: '/images/spider-man.jpg',
        link: 'https://example.com/spider-man',
      });

      component.onSubmit();

      expect(updateMock).toHaveBeenCalledExactlyOnceWith('1', {
        name: 'Spider-Man',
        realName: 'Peter Parker',
        imageUrl: '/images/spider-man.jpg',
        link: 'https://example.com/spider-man',
      });
    });

    it('should show loading while an existing hero is being loaded', () => {
      facadeMock.loading.set(true);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Cargando heroe...');
    });
  });
});
