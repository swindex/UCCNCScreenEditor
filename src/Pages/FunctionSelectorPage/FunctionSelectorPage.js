import { DOM } from "leet-mvc/core/DOM";
import { Objects } from "leet-mvc/core/Objects";
import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import * as style from "./FunctionSelectorPage.scss";
export class FunctionSelectorPage extends DialogPage {
  constructor(){
    super();

    this.selectedValue = null;
    this.selectedItem = null;
    this.items = [];
    this.filteredItems = [];
    this.searchText = null;
    this.buttons = {
      Close: null,
      Select: ()=>{
        this.onItemSelected(this.selectedItem);   
      }
    }
  }

  itemsChange(val){
    this.filteredItems = Objects.copy(val)
  }

  onItemSelected(selectedValue){

  }

  onItemClicked(item){
    this.selectedItem = item;
  }

  selectedValueChange(val){
    if (val) {
      this.selectedItem =  Objects.find(this.items, f=>f.value==val);
    }
  }

  

  searchTextChange(value) {
    if (typeof value == "symbol") return;
    if (!value) {
      this.filteredItems = this.items.slice();
      return
    }

    this.filteredItems = Objects.filter(this.items, f=>{
      return !!(f.value+ " " + f.title+ " " + f.text).match(new RegExp(value, 'g'));
    })

  }

  onInit(){
    setTimeout(()=>{
      var el = DOM(this.page).find(".item[selected]").first()
      if (el)
        el.scrollIntoView();
    },100)
  }

  get template (){
    return this.extendTemplate(super.template, template)
  }
}

FunctionSelectorPage.selector = "page-FunctionSelectorPage";

var template = `
<div class="searchblock">
  <div class="fieldgroup">
    <div class="fieldrow">
      <input type="text" bind="this.searchText" placeholder="Search text..">
      <div class="icon"><i class="fas fa-search"></i></div>
    </div>
   </div> 
</div>
<div class="list">
  <div class="item" [foreach]="this.filteredItems as item" [selected]="this.selectedItem && item.value == this.selectedItem.value" onclick="this.onItemClicked(item)">
    <div class="value">{{ item.value }}</div>
    <div class="title">{{ item.title }}</div>
    <div class="text" [if]="item.text">{{ item.text }}</div>
  </div>
</div>
`