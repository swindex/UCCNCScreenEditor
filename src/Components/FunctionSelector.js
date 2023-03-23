import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { FunctionSelectorPage } from "../Pages/FunctionSelectorPage/FunctionSelectorPage";
import { PictureGallery } from "./PictureGallery";

const { BaseComponent } = require("leet-mvc/components/BaseComponent");
const { Forms } = require("leet-mvc/components/Forms");
const { DOM } = require("leet-mvc/core/DOM");
const { Injector } = require("leet-mvc/core/Injector");
const { Objects } = require("leet-mvc/core/Objects");
const { RegisterComponent } = require("leet-mvc/core/Register");
const { Alert } = require("leet-mvc/core/simple_confirm");
const { OptionsDialogPage } = require("leet-mvc/pages/OptionsDialogPage/OptionsDialogPage");

export class FunctionSelector extends BaseComponent{
  constructor(){
    super();
    this.title="Hooo"
    /** @type {ResolvedPicture[]} */
    this.items = []
    this.value = null;
    this.image = null;
    this.template = `<div class="fieldrow">
      <input type="text" bind="this.displayValue" [attribute]="this.attributes" disabled autocomplete="off" onchange = "this.onChange($event)" />
			<div class="icon" style="color: white; background-color: #2196f3; padding: 3px 5px; height: auto; cursor: pointer; border-radius: 2px;" onclick="this.onIconClick()"><i class="fas fa-search"></i></div>
    </div>`

  }

  /** @override */
  onChange(event){

  }

  get displayValue(){
    var selectedItem =  Objects.find(this.items, f=>f.value == this.value);

    return selectedItem ? `${selectedItem.value} - ${selectedItem.title}` : null;
  }

  onIconClick(){
    if (!this.items || this.items.length ==0) {
      Alert("Items is empty!")
    }

    var p = Injector.Nav.push(new FunctionSelectorPage("Select Controll Function"));
    p.items = Objects.copy(this.items);
    p.selectedValue = this.value;
    p.onItemSelected = (item) =>{
      this.value = item.value;
      this.onChange({target: DOM(this.container).find('input').first()})
    }
    
  }

  static Use(){
    RegisterComponent(FunctionSelector, 'function-select');
    Forms.field_definitions["function-select"] = function(forms, el, parentPath){
      return forms.renderFieldGroupHTML(el, `<function-select name="${el.name}"
          (onChange)="this.events.change.apply(null,arguments)"
          [(value)]= "${forms.refactorAttrName('this.data.' + el._name)}"
          placeholder="${el.placeholder}"
          [items] = "${forms.refactorAttrName('this.fields.' + el._name + '.items')}"
          (returnContext)="${forms.refactorAttrName('this.fields.' + el._name)}.context = arguments[0];"
          >
        </function-select>`
      );
    }
  }
}

