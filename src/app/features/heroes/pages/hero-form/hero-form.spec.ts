import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroForm } from './hero-form';
import { signal } from '@angular/core';
import { HeroFormFacade } from '../../services/hero-form.facade';

describe('HeroForm', () => {
  let component: HeroForm;
  let fixture: ComponentFixture<HeroForm>;

  const createMock = vi.fn();
  const cancelMock = vi.fn();

  const facadeMock = {
    submitting: signal(false),
    error: signal<string | null>(null),
    create: createMock,
    cancel: cancelMock,
  };

  beforeEach(async () => {
    createMock.mockReset();
    cancelMock.mockReset();
    facadeMock.submitting.set(false);
    facadeMock.error.set(null);

    await TestBed.configureTestingModule({
      imports: [HeroForm],
      providers: [
        {
          provide: HeroFormFacade,
          useValue: facadeMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an empty form', () => {
    expect(component.form.getRawValue()).toEqual({
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

  it('should require a minimum length of two characters', () => {
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

  it('should cancel through the facade', () => {
    facadeMock.submitting.set(true);
    component.onCancel();

    expect(cancelMock).toHaveBeenCalledOnce();
  });
});
