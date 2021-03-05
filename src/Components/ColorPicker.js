const { BaseComponent } = require("leet-mvc/components/BaseComponent");
const { Forms } = require("leet-mvc/components/Forms");
const { DOM } = require("leet-mvc/core/DOM");
const { Injector } = require("leet-mvc/core/Injector");
const { Objects } = require("leet-mvc/core/Objects");
const { RegisterComponent } = require("leet-mvc/core/Register");
const { Alert } = require("leet-mvc/core/simple_confirm");
const { OptionsDialogPage } = require("leet-mvc/pages/OptionsDialogPage/OptionsDialogPage");

export class ColorPicker extends BaseComponent{
  constructor(){
    super();

    this.items = []
    this.value = null;
    this.valueT = null;
    this.valueC = null;
    

    this.image = null;
    this.template = `<div class="fieldrow">
      <input type="text" bind="this.valueT" [attribute]="this.attributes" autocomplete="off" onchange = "this._onChange($event)" />
      <input type="color" bind="this.valueC"  style="width:2em;position: absolute; right: 0; top: 0;" autocomplete="off" onchange = "this._onChange($event)" />
    </div>`
  }

  valueChange(val){
    this.valueT = this.valueC = val ? normalColor(val) : null;
  }

  _onChange(event){

    this.value = event.target.value ? normalColor(event.target.value) : null;
    this.onChange(event);
  }

  static Use(){
    RegisterComponent(ColorPicker, 'color-picker');
    Forms.field_definitions["color-picker"] = function(forms, el, parentPath){
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
function normalColor(str){
  var ctx = document.createElement('canvas').getContext("2d");
  ctx.fillStyle = str;
  return ctx.fillStyle.toUpperCase();
}
