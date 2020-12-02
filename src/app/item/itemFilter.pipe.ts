import { Pipe, PipeTransform } from '@angular/core';
import { Item } from './item';

@Pipe({
  name: 'filter'
})
export class ItemFilterPipe implements PipeTransform {
  transform(items: Item[], searchText: string) {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(i => {
      return i.name.toLowerCase().includes(searchText);
    });
  }
}
