import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[OnlyNumber]'
})
export class OnlyNumber {

  constructor(private el: ElementRef) {
  }

  @Input() OnlyNumber: boolean;

  @HostListener('keydown', ['$event']) onKeyDown(event: any) {
    let e = <KeyboardEvent> event;
    if (this.OnlyNumber) {

      if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl/Command+A
        (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey)) ||
        // Allow: Ctrl/Command+C
        (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey)) ||
        // Allow: CtrlCommand+X
        (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey)) ||
        // Allow: CtrlCommand+V
        // (e.keyCode == 86 && (e.ctrlKey === true || e.metaKey)) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 40)) {
        // let it happen, don't do anything
        return;
        // 190 for .
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    }
  }
}
