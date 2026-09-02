import { Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[heroUppercase]',
  host: {
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: HeroUppercaseDirective,
      multi: true,
    },
  ],
})
export class HeroUppercaseDirective implements ControlValueAccessor {
  private readonly _renderer = inject(Renderer2);
  private readonly _elementRef = inject(ElementRef<HTMLInputElement>);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {}
  writeValue(value: string | null): void {
    const uppercaseValue = value?.toUpperCase() ?? '';

    this._renderer.setProperty(this._elementRef.nativeElement, 'value', uppercaseValue);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const uppercaseValue = input.value.toUpperCase();
    this._renderer.setProperty(input, 'value', uppercaseValue);
    this.onChange(uppercaseValue);
  }

  onBlur(): void {
    this.onTouched();
  }
}
