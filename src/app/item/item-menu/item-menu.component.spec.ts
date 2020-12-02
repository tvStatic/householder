import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemMenuComponent } from './item-menu.component';
import { Item } from '../item';

describe('ItemMenuComponent', () => {
  let component: ItemMenuComponent;
  let fixture: ComponentFixture<ItemMenuComponent>;
  let item: Item;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ItemMenuComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    item = new Item();

    fixture = TestBed.createComponent(ItemMenuComponent);
    component = fixture.componentInstance;
    component.item = item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
