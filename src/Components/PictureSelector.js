import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { PictureGallery } from "./PictureGallery";

const { BaseComponent } = require("leet-mvc/components/BaseComponent");
const { Forms } = require("leet-mvc/components/Forms");
const { DOM } = require("leet-mvc/core/DOM");
const { Injector } = require("leet-mvc/core/Injector");
const { Objects } = require("leet-mvc/core/Objects");
const { RegisterComponent } = require("leet-mvc/core/Register");
const { Alert } = require("leet-mvc/core/simple_confirm");
const { OptionsDialogPage } = require("leet-mvc/pages/OptionsDialogPage/OptionsDialogPage");

export class PictureSelector extends BaseComponent{
  constructor(){
    super();

    /** @type {ResolvedPicture[]} */
    this.items = []
    this.value = null;
    this.image = null;
    this.template = `<div class="fieldrow">
      <input type="text" bind="this.value" [attribute]="this.attributes" autocomplete="off" onchange = "this.onChange($event)" />
			<div class="icon" style="color: white; background-color: #2196f3; padding: 3px 5px; height: auto; cursor: pointer; border-radius: 2px;" onclick="this.onIconClick()"><i class="fas fa-images"></i></div>
    </div>`

  }

  /** @override */
  onChange(event){

  }

  onIconClick(){
    if (!this.items || this.items.length ==0) {
      Alert("Items is empty!")
    }

    var p = Injector.Nav.push(new DialogPage("Select Picture"));
    var pS = new PictureGallery();
    pS.items = this.items;


    pS.onItemClick = (item, index)=>{
      p.destroy();
      this.value = item.picN;
      this.onChange({target: DOM(this.container).find('input').first()})
    }
    
    p.buttons = {
      Close:()=>{
        p.destroy();
      }
    }

    // @ts-ignore
    p.content = pS;

    p.onVisible = ()=>{
      pS.setSelectedIndex(this.items.findIndex(el=>el.picN == this.value))
    }
    /*p.onItemClicked = (item) =>{
      this.value = item.value;
      this.onChange({target: DOM(this.container).find('input').first()})
    }*/
    
  }

  static Use(){
    RegisterComponent(PictureSelector, 'picture-select');
    Forms.field_definitions["picture-select"] = function(forms, el, parentPath){
      return forms.renderFieldGroupHTML(el, `<picture-select name="${el.name}"
          (onChange)="this.events.change.apply(null,arguments)"
          [(value)]= "${forms.refactorAttrName('this.data.' + el._name)}"
          placeholder="${el.placeholder}"
          [items] = "${forms.refactorAttrName('this.fields.' + el._name + '.items')}"
          (returnContext)="${forms.refactorAttrName('this.fields.' + el._name)}.context = arguments[0];"
          >
        </picture-select>`
      );
    }
  }
}

