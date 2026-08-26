import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestHost } from '../testing/uppercase-test-host';

describe('HeroUppercase', () => {
  let fixture: ComponentFixture<TestHost>;
  let component: TestHost;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    component = fixture.componentInstance;
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    fixture.detectChanges();
  });

  it('should transform typed text to uppercase', () => {
    input.value = 'Spider-Man';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('SPIDER-MAN');
  });

  it('should update the FormControl with the uppercase value', () => {
    input.value = 'Spider-Man';
    input.dispatchEvent(new Event('input'));

    expect(component.control.value).toBe('SPIDER-MAN');
  })

  it('should keep an already uppercase value unchanged', () => {
    input.value = 'SPIDER-MAN';
    input.dispatchEvent(new Event('input'));

    expect(component.control.value).toBe('SPIDER-MAN');
    expect(component.control.value).toBe('SPIDER-MAN');
  })

  /* it('should write programmatic values in uppercase to the input', () => {
    component.control.setValue('Spider-Man');

    fixture.detectChanges();

    expect(input.value).toBe('SPIDER-MAN');
  });

  it('should mark the control as touched on blur', () => {
    expect(component.control.touched).toBe(false);

    input.dispatchEvent(new Event('blur'));

    expect(component.control.touched).toBe(true);
  });

  it('should reflect the disabled state in the input', () => {
    component.control.disable();

    fixture.detectChanges();

    expect(input.disabled).toBe(true);
  }); */


});
