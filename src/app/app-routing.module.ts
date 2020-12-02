import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatusListComponent } from './item/status-list/status-list.component';
import { ItemDetailComponent } from './item/item-detail/item-detail.component';
import { ShoppingListComponent } from './item/shopping-list/shopping-list.component';

const routes: Routes = [
  { path: 'status', component: StatusListComponent },
  { path: 'new', component: ItemDetailComponent },
  { path: 'edit/:id', component: ItemDetailComponent },
  { path: 'shoppingList', component: ShoppingListComponent },
  { path: '', redirectTo: '/status', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
