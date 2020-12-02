import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  private errors: string[] = [];

  constructor() {}

  add(err: string) {
    this.errors.push(err);
  }

  pop() {
    this.errors.shift();
  }

  peek() {
    if (this.errors.length === 0) {
      return undefined;
    }

    return this.errors[0];
  }

  hasErrors() {
    return this.errors.length > 0;
  }
}
