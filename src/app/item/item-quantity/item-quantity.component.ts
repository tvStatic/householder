import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from '@angular/core';
import { Item } from '../item';

@Component({
  selector: 'item-quantity',
  templateUrl: './item-quantity.component.html',
  styleUrls: ['./item-quantity.component.less']
})
export class ItemQuantityComponent implements OnInit {
  @Input() quantity?: number;
  @Input() unit?: string;
  @Input() incrementAmount?: number;
  @Output() update = new EventEmitter<number | undefined>();

  constructor() {}

  ngOnInit(): void {}

  inc() {
    const inc = this.incrementAmount || 1;

    if (!this.quantity) {
      this.update.emit(inc);
    } else {
      this.update.emit(this.quantity + inc);
    }
  }

  dec() {
    const inc = this.incrementAmount || 1;

    if (this.quantity) {
      let newVal = this.quantity - inc;
      if (newVal < 0) {
        newVal = 0;
      }
      this.update.emit(newVal);
    }
  }

  updateQuantity() {
    this.update.emit(this.quantity);
  }

  onDrag(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
