import { BaseComponent } from "leet-mvc/components/BaseComponent";
import { DOM } from "leet-mvc/core/DOM";
import "./PictureGallery.scss";

export class PictureGallery extends BaseComponent {
  constructor(){
    super();
    /** @type {ResolvedPicture[]} */

    this.items = [];
    this.editControls = false;
    this.selectedItem = null;
    this.selectedIndex = null;
    this.template = `
    <div  class="PictureGallery">
      <div [foreach]="index in this.items as item" onclick="this._onItemClick(item, index);" [selected]="index == this.selectedIndex" class="PictureGallery-item">
        <div class="PictureGallery-imageN">
          {{ item.picN }}
        </div>
        <div class="PictureGallery-image">
          <img [src]="item.picture_up" [if]="item.picture_up"/>
          <div class="PictureGallery-title">{{ item.picture_up_name }}</div>
          <div class="PictureGallery-buttons" [if]="this.editControls"><button class="select" onclick="this.onPictureUpSelect(item,index)">Select</button><button class="remove" onclick="this.onPictureUpRemove(item,index)">Remove</button></div>
        </div>
        
        <div class="PictureGallery-image">
          <img [src]="item.picture_down"  [if]="item.picture_down" />
          <div class="PictureGallery-title">{{ item.picture_down_name }}</div>
          <div class="PictureGallery-buttons" [if]="this.editControls"><button class="select" onclick="this.onPictureDownSelect(item,index)">Select</button><button class="remove" onclick="this.onPictureDownRemove(item,index)">Remove</button></div>
        </div>

      </div>
    </div>`;
  }
  /**
   * @param {ResolvedPicture} item 
   * @param {number} index 
   */
  onPictureUpSelect(item,index){}
  /**
   * @param {ResolvedPicture} item 
   * @param {number} index 
   */
  onPictureDownSelect(item,index){}
  /**
   * @param {ResolvedPicture} item 
   * @param {number} index 
   */
  onPictureUpRemove(item,index){}
  /**
   * @param {ResolvedPicture} item 
   * @param {number} index 
   */
  onPictureDownRemove(item,index){}
  /**
   * @param {ResolvedPicture} item 
   * @param {number} index 
   */
  onItemClick(item, index) {

  }

  setSelectedIndex(index, scrolldelay){
    this.selectedIndex = index;
    this.selectedItem = this.items[index];
    setTimeout(() => {
      DOM(this.container).find(".PictureGallery [selected]").first().scrollIntoView();
    }, scrolldelay);
  }

  _onItemClick(item, index) {
    this.selectedItem = item;
    this.selectedIndex = index;
    this.onItemClick(item,index)
  }
}