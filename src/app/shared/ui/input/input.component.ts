import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uid = 0;

/** Champ texte réutilisable, compatible Reactive Forms (ControlValueAccessor). */
@Component({
  selector: 'app-input',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true },
  ],
  template: `
    <div class="flex flex-col gap-1">
      @if (label) {
        <label [for]="id" class="text-sm font-medium text-gray-700">
          {{ label }}@if (required) {<span class="text-danger"> *</span>}
        </label>
      }
      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [attr.aria-invalid]="invalid"
        class="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
        [class.border-gray-300]="!invalid"
        [class.border-danger]="invalid"
        [class.focus:ring-brand-500]="!invalid"
        [class.focus:border-brand-500]="!invalid"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      @if (invalid && error) {
        <span class="text-xs text-danger">{{ error }}</span>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() invalid = false;
  @Input() error = '';
  @Input() id = `app-input-${uid++}`;

  value = '';
  disabled = false;
  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: string): void {
    this.value = v ?? '';
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  onInput(e: Event): void {
    this.value = (e.target as HTMLInputElement).value;
    this.onChange(this.value);
  }
}
