import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { PictureGallery } from "./PictureGallery";
import { BaseComponent } from "leet-mvc/components/BaseComponent";
import { Forms } from "leet-mvc/components/Forms";
import { DOM } from "leet-mvc/core/DOM";
import { Injector } from "leet-mvc/core/Injector";
import { Objects } from "leet-mvc/core/Objects";
import { RegisterComponent } from "leet-mvc/core/Register";
import { Alert } from "leet-mvc/core/simple_confirm";
import { OptionsDialogPage } from "leet-mvc/pages/OptionsDialogPage/OptionsDialogPage";

export interface ResolvedPicture {
  picN: string | number;
  picture_up?: string;
  picture_up_name?: string;
}

export class PictureSelector extends BaseComponent {
  items: ResolvedPicture[] = [];
  value: string | number | null = null;
  image: string | null = null;

  constructor() {
    super();
  }

  get template(): string {
    return `<div class="fieldrow">
      <input type="text" bind="this.value" [attribute]="this.attributes" autocomplete="off" onchange = "this.onChange($event)" />
			<div class="icon" style="color: white; background-color: #2196f3; padding: 3px 5px; height: auto; cursor: pointer; border-radius: 2px;" data-cy="onIconClick" onclick="this.onIconClick()"><i class="fas fa-images"></i></div>
    </div>`;
  }

  onChange(event: Event) {
    // Override in subclass
  }

  onIconClick() {
    if (!this.items || this.items.length == 0) {
      Alert("Items is empty!")
    }

    var p = Injector.Nav.push(new DialogPage("Select Picture"));
    var pS = new PictureGallery();
    pS.items = this.items;

    pS.onItemClick = (item: ResolvedPicture, index: number) => {
      p.destroy();
      this.value = item.picN;
      this.onChange({target: DOM(this.container).find('input').first()} as any);
    }
    
    (p as any).buttons = {
      "Close": () => {
        p.destroy();
      }
    };

    (p as any).content = pS;

    p.onVisible = () => {
      pS.setSelectedIndex(this.items.findIndex(el => el.picN == this.value))
    }
  }

  static Use() {
    RegisterComponent(PictureSelector, 'picture-select');
    Forms.field_definitions["picture-select"] = function(forms: any, el: any, parentPath: any) {
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
