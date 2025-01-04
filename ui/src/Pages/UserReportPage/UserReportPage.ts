import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";

import "./UserReportPage.scss";
import { DOM } from "leet-mvc/core/DOM";
import { UserItem } from "../../../typings/APIRequests";
import { Objects } from "leet-mvc/core/Objects";
import { HeaderPage } from "leet-mvc/pages/HeaderPage/HeaderPage";

export class UserReportPage extends HeaderPage {
  title = "Users Report"
  items: UserItem[] = [];
  selectedItem: UserItem;
  filteredItems: UserItem[] = [];
  backButton = true;
  searchText = "";

  constructor() {
    super()
  }

  itemsChange(val) {
    this.filteredItems = Objects.copy(val)
  }

  onItemSelected(selectedValue) {

  }

  onItemClicked(item) {
    this.selectedItem = item;
  }

  selectedValueChange(val) {
    if (val) {
      //this.selectedItem =  Objects.find(this.items, f=>f.value==val);
    }
  }

  filter(value) {
    if (typeof value == "symbol") return;
    if (!value) {
      this.filteredItems = this.items.slice();
      return
    }

    let reg = new RegExp(value, 'gi')

    this.filteredItems = Objects.filter(this.items, f => {
      return !!(JSON.stringify(f)).match(reg);
    })

  }

  formatDate(value: Date){
    return value.toLocaleDateString() + " " + value.toLocaleTimeString();
  }

  print(){
    window.print();
  }

  buttons = {
    Close: () => {
      this.destroy();
    }
  }

  get template() {
    return this.extendTemplate(super.template, template)
  }
}

UserReportPage.selector = 'page-UserReportPage'

var template = `
<div class="searchblock">
  <div class="buttons">
    <button type="button" class="btn btn-xl btn-primary" data-cy="print" onclick="this.print()"><i class="fa fa-print"></i></button>
  </div>
  <div class="fieldgroup">
    <div class="fieldrow">
      <input type="text" bind="this.searchText" placeholder="Search text.." oninput="this.filter(this.searchText)">
      <div class="icon"><i class="fas fa-search"></i></div>
    </div>
   </div> 
</div>

<div class="list" id="printarea">
  <div class="item header">
    <div class="column">First Name</div>
    <div class="column">Last Name</div>
    <div class="column">Username</div>
    <div class="column role">Role</div>
    <div class="column date">Created</div>
    <div class="column date">Updated</div>
  </div>
  <div class="item" [foreach]="this.filteredItems as item" [selected]="this.selectedItem && item.id == this.selectedItem.id" data-cy="onItemClicked" onclick="this.onItemClicked(item)">
    <div class="column">{{ item.first_name }}</div>
    <div class="column">{{ item.last_name }}</div>
    <div class="column">{{ item.username }}</div>
    <div class="column role">{{ item.role_name }}</div>
    <div class="column date">{{ this.formatDate(item.created_at) }}</div>
    <div class="column date">{{ this.formatDate(item.updated_at) }}</div>
  </div>
</div>
`