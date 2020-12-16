import {Directive} from '@angular/core';
import {NG_VALIDATORS, Validator, FormControl} from '@angular/forms';

@Directive({
  selector: '[accepted]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: AcceptedValidator, multi: true},
  ]
})
export class AcceptedValidator implements Validator {
  static validate(c: FormControl): { [key: string]: any } {
    if (c.value) {
      return null;
    }else {
      return {'accepted': true};
    }

    // return c.value == null || c.value.length == 0 || !c.value ? { "accepted" : true} : null;
  }

  validate(c: FormControl): { [key: string]: any } {
    return AcceptedValidator.validate(c);
  }
}
