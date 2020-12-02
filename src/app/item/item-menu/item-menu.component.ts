import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Item } from '../item';

@Component({
  selector: 'item-menu',
  templateUrl: './item-menu.component.html',
  styleUrls: ['./item-menu.component.less']
})
export class ItemMenuComponent implements OnInit {
  @Input() item: Item;
  @Input() className?: string;
  @Output() toggleActive = new EventEmitter();
  @Output() delete = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onToggleActive() {
    this.toggleActive.emit();
  }

  deleteItem() {
    this.delete.emit();
  }
}
