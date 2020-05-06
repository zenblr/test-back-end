import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'schemeAmount'
})
export class SchemeAmountPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    // return null;
    value = +(value);
    if (value < 1000) {
      return value;
    }

    else if (value >= 1000 && value < 100000) {
      return (value / 1000) + 'K';
    }

    else if (value >= 100000 && value < 10000000) {
      return (value / 100000) + 'L';
    }

    else {
      return value;
    }
  }

}
