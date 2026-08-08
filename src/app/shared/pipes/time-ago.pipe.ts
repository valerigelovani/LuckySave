import { Pipe, PipeTransform } from '@angular/core';
import { timeAgo } from '../../core/utils/date.util';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string): string {
    return timeAgo(value);
  }
}
