import {Component, Directive, Input} from '@angular/core';

@Directive({
  selector: '[href]',
  host: {
    '(click)': 'preventDefault($event)'
  }
})
export class NoActionLink {
  @Input() href: any;

  preventDefault(event: any) {
    if (this.href.length == 0) event.preventDefault();
  }
}
