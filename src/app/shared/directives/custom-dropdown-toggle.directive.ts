import {Directive, Input, Output, EventEmitter, ElementRef} from '@angular/core';

@Directive({
  selector: '[customDropdownToggle]',
  exportAs: 'customDropdownToggle',
  host: {
    '(document:keyup.esc)': 'closeKeyUpEsc()',
    '(document:click)': 'closeFromOutsideClick($event)'
  }
})
export class CustomDropdownToggle {
  private _toggleElement: any;
  @Output() closeDpDown: EventEmitter<any> = new EventEmitter<any>();

  constructor(elementRef: ElementRef) {
    this._toggleElement = elementRef.nativeElement;
  }

  closeFromOutsideClick($event: any) {
    if ($event.button !== 2 && !this._isEventFromToggle($event)) {
      this.closeDpDown.emit();
    }
  }

  closeKeyUpEsc() {
    this.closeDpDown.emit();
  }

  private _isEventFromToggle($event: any) {
    return !!this._toggleElement && this._toggleElement.contains($event.target);
  }
}
