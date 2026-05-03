import { BaseComponent } from "leet-mvc/components/BaseComponent";
import { DOM } from "leet-mvc/core/DOM";
import "./PictureGallery.scss";

export interface ResolvedPicture {
  picN: string | number;
  picture_up?: string;
  picture_up_name?: string;
  picture_down?: string;
  picture_down_name?: string;
}

export class PictureGallery extends BaseComponent {
  items: ResolvedPicture[];
  editControls: boolean;
  selectedItem: ResolvedPicture | null;
  selectedIndex: number | null;

  constructor() {
    super();

    this.items = [];
    this.editControls = false;
    this.selectedItem = null;
    this.selectedIndex = null;
  }
  get template() {
    return `<div  class="PictureGallery">
      <div [foreach]="index in this.items as item" data-cy="onItemClick" onclick="this._onItemClick(item, index);" [selected]="index == this.selectedIndex" class="PictureGallery-item">
        <div class="PictureGallery-imageN">
          {{ item.picN }}
        </div>
        <div class="PictureGallery-image">
          <img [src]="item.picture_up" [if]="item.picture_up"/>
          <div class="PictureGallery-title">{{ item.picture_up_name }}</div>
          <div class="PictureGallery-buttons" [if]="this.editControls"><button class="select" data-cy="onPictureUpSelect" onclick="this.onPictureUpSelect(item,index)">Select</button><button class="remove" data-cy="onPictureUpRemove" onclick="this.onPictureUpRemove(item,index)">Remove</button></div>
        </div>
        
        <div class="PictureGallery-image">
          <img [src]="item.picture_down"  [if]="item.picture_down" />
          <div class="PictureGallery-title">{{ item.picture_down_name }}</div>
          <div class="PictureGallery-buttons" [if]="this.editControls"><button class="select" data-cy="onPictureDownSelect" onclick="this.onPictureDownSelect(item,index)">Select</button><button class="remove" data-cy="onPictureDownRemove" onclick="this.onPictureDownRemove(item,index)">Remove</button></div>
        </div>

      </div>
    </div>`;
  }

  onPictureUpSelect(item: ResolvedPicture, index: number) {}

  onPictureDownSelect(item: ResolvedPicture, index: number) {}

  onPictureUpRemove(item: ResolvedPicture, index: number) {}

  onPictureDownRemove(item: ResolvedPicture, index: number) {}

  onItemClick(item: ResolvedPicture, index: number) {}

  setSelectedIndex(index: number, scrolldelay?: number) {
    this.selectedIndex = index;
    this.selectedItem = this.items[index];
    setTimeout(() => {
      DOM(this.container).find(".PictureGallery [selected]").first()?.scrollIntoView();
    }, scrolldelay);
  }

  _onItemClick(item: ResolvedPicture, index: number) {
    this.selectedItem = item;
    this.selectedIndex = index;
    this.onItemClick(item, index);
  }
}
