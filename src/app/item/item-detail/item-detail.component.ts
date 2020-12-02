import { Component, OnInit } from '@angular/core';
import { ItemService } from '../item.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../item';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.less']
})
export class ItemDetailComponent implements OnInit {
  id: string;
  item: Item;
  isEdit: boolean;

  allCategories: string[] = [];
  allLocations: string[] = [];

  locationFocus$ = new Subject<string>();
  categoryFocus$ = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.item = Object.assign(new Item(), this.itemService.get(this.id));
      this.isEdit = true;
    } else {
      this.item = new Item();
    }

    this.allCategories = this.itemService.getAllCategories();
    this.allLocations = this.itemService.getAllLocations();
  }

  private returnToList() {
    this.router.navigate(['/status']);
  }

  save() {
    this.item.setQuantityStatus();

    if (this.isEdit) {
      this.itemService.updateItem(this.item);
    } else {
      this.itemService.addItem(this.item);
    }

    this.returnToList();
  }

  cancel() {
    this.returnToList();
  }

  mapFunc(source: string[]) {
    return (term: string) => {
      return term === ''
        ? source
        : source.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1);
    };
  }

  locationSearch = (text$: Observable<string>) => {
    return merge(
      text$.pipe(debounceTime(200), distinctUntilChanged()),
      this.locationFocus$
    ).pipe(map(this.mapFunc(this.allLocations)));
  };

  categorySearch = (text$: Observable<string>) => {
    return merge(
      text$.pipe(debounceTime(200), distinctUntilChanged()),
      this.categoryFocus$
    ).pipe(map(this.mapFunc(this.allCategories)));
  };
}
