import { BaseComponent } from "leet-mvc/components/BaseComponent";
import { DOM } from "leet-mvc/core/DOM";
import "./PictureGallery.scss";

export interface ResolvedPicture {
  picN: string | number;
  picture_up?: string;
  picture_up_name?: string;
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

  get template(): string {
    return `
    <div  class="PictureGallery">
      <div [foreach]="index in this.items as item" data-cy="onItemClick" onclick="this._onItemClick(item, index);" [selected]="index == this.selectedIndex" class="PictureGallery-item">
        <div class="PictureGallery-imageN">
          {{ item.picN }}
        </div>
        <div class="PictureGallery-image">
          <img [src]="item.picture_up" [if]="item.picture_up"/>
          <div class="PictureGallery-title">{{ item.picture_up_name }}</div>
          <div class="PictureGallery-controls" [if]="this.editControls">
            <button class="btn btn-danger" onclick="this.onDeleteClicked(item, index)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  _onItemClick(item: ResolvedPicture, index: number) {
    this.setSelectedIndex(index);
    this.onItemClick(item, index);
  }

  onItemClick(item: ResolvedPicture, index: number) {
    // Override in subclass
  }

  onDeleteClicked(item: ResolvedPicture, index: number) {
    // Override in subclass
  }

  setSelectedIndex(index: number) {
    this.selectedIndex = index;
    this.selectedItem = this.items[index];
  }
}
