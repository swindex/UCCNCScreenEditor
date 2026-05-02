import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { FunctionSelectorPage } from "../Pages/FunctionSelectorPage/FunctionSelectorPage";
import { PictureGallery } from "./PictureGallery";
import { BaseComponent } from "leet-mvc/components/BaseComponent";
import { Forms } from "leet-mvc/components/Forms";
import { DOM } from "leet-mvc/core/DOM";
import { Injector } from "leet-mvc/core/Injector";
import { Objects } from "leet-mvc/core/Objects";
import { RegisterComponent } from "leet-mvc/core/Register";
import { Alert } from "leet-mvc/core/simple_confirm";

export interface FunctionItem {
  value: string | number;
  title: string;
  text?: string;
}

export class FunctionSelector extends BaseComponent {
  title: string;
  items: FunctionItem[];
  value: string | number | null;
  image: string | null;
  displayText: string;

  constructor() {
    super();
    this.title = "Function Selector";
    this.items = [];
    this.value = null;
    this.image = null;
    this.displayText = '';
  }

  valueChange(newValue: string | number | null) {
    this.updateDisplayText();
  }

  itemsChange(newItems: FunctionItem[]) {
    this.updateDisplayText();
  }

  updateDisplayText() {
    if (!this.value) {
      this.displayText = '';
      return;
    }
    
    // Find the matching item from items array
    const item = this.items?.find(i => String(i.value) === String(this.value));
    
    if (item) {
      this.displayText = `${item.value} - ${item.title}`;
    } else {
      // Fallback to just the value if no match found
      this.displayText = String(this.value);
    }
  }

  get template(): string {
    return `<div class="fieldrow">
      <input type="text" bind="this.displayText" [attribute]="this.attributes" autocomplete="off" onchange = "this.onChange($event)" />
			<div class="icon" style="color: white; background-color: #2196f3; padding: 3px 5px; height: auto; cursor: pointer; border-radius: 2px;" data-cy="onIconClick" onclick="this.onIconClick()"><i class="fas fa-cog"></i></div>
    </div>`;
  }

  onChange(event: Event) {
    // Extract numeric value from displayText if needed
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      const match = input.value.match(/^(\d+)/);
      if (match) {
        this.value = match[1];
      }
    }
    // Override in subclass
  }

  onIconClick() {
    if (!this.items || this.items.length == 0) {
      Alert("Items is empty!")
    }

    var p = Injector.Nav.push(new FunctionSelectorPage(this.title));
    p.items = this.items;
    p.onItemClicked = (item: FunctionItem) => {
      this.value = item.value;
      this.onChange({target: DOM(this.container).find('input').first()} as any);
    }
  }

  static Use() {
    RegisterComponent(FunctionSelector, 'function-select');
    Forms.field_definitions["function-select"] = function(forms: any, el: any, parentPath: any) {
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
