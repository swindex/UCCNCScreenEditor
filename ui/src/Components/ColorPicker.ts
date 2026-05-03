import { BaseComponent } from "leet-mvc/components/BaseComponent";
import { Forms } from "leet-mvc/components/Forms";
import { DOM } from "leet-mvc/core/DOM";
import { Injector } from "leet-mvc/core/Injector";
import { Objects } from "leet-mvc/core/Objects";
import { RegisterComponent } from "leet-mvc/core/Register";
import { Alert } from "leet-mvc/core/simple_confirm";
import { OptionsDialogPage } from "leet-mvc/pages/OptionsDialogPage/OptionsDialogPage";

export class ColorPicker extends BaseComponent {
  items: any[];
  value: string | null;
  valueT: string | null;
  valueC: string | null;
  image: any | null;

  constructor() {
    super();

    this.items = [];
    this.value = null;
    this.valueT = null;
    this.valueC = null;

    this.image = null;
  }

  get template(): string {
    return `<div class="fieldrow">
      <input type="text" bind="this.valueT" [attribute]="this.attributes" autocomplete="off" onchange = "this._onChange($event)" />
      <input type="color" bind="this.valueC"  style="width: 2em;position: absolute;right: 0;top: 0;height: 1.75em;" autocomplete="off" onchange = "this._onChange($event)" />
    </div>`;
  }

  valueChange(val: string | null) {
    this.valueT = this.valueC = val ? normalColor(val) : null;
  }

  _onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value ? normalColor(target.value) : null;
    this.onChange(event);
  }

  onChange(event: Event) {
    // Override in subclass
  }

  static Use() {
    RegisterComponent(ColorPicker, 'color-picker');
    Forms.field_definitions["color-picker"] = function(forms: any, el: any, parentPath: any) {
      return forms.renderFieldGroupHTML(el, `<color-picker name="${el.name}"
          (onChange)="this.events.change.apply(null,arguments)"
          [(value)]= "${forms.refactorAttrName('this.data.' + el._name)}"
          placeholder="${el.placeholder}"
          >
        </color-picker>`
      );
    }
  }
}

/**
 * 
 * @param {string} str - any color name or string
 * @return {string} - returns #FFFFFF type color
 */
function normalColor(str: string): string {
  var ctx = document.createElement('canvas').getContext("2d");
  if (ctx) {
    ctx.fillStyle = str;
    return ctx.fillStyle.toUpperCase();
  }
  return str;
}
