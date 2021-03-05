import { Objects } from "leet-mvc/core/Objects";
import { Alert, Prompt } from "leet-mvc/core/simple_confirm";
import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import { PictureGallery } from "../Components/PictureGallery";
import { FileHelpers } from "../FileHelpers";
import { PictureNode } from "../Parser";

export class PictureListEditor extends DialogPage {
  constructor(){
    super();

    this.region = null;
    this.container = null;

    this.gallery = new PictureGallery();
    this.gallery.editControls = true;
    /** @type {string|null} */
    this.BMPFolder = null;

    this.gallery.onPictureUpSelect = (item, index)=>{
      FileHelpers.selectFileFromDiskGetContents().then(ret=>{
        item.picture_up = ret.contents;
        item.picture_up_name =  ret.file.name;
        item.picture.picture_up = this.BMPFolder + ret.file.name;
      })
    }
    this.gallery.onPictureDownSelect = (item, index)=>{
      FileHelpers.selectFileFromDiskGetContents().then(ret=>{
        item.picture_down = ret.contents;
        item.picture_down_name =  ret.file.name;
        item.picture.picture_down = this.BMPFolder + ret.file.name;
      })
    }

    this.gallery.onPictureUpRemove = (item, index)=>{
      item.picture_up = null;
      item.picture_up_name =  null;
      item.picture.picture_up = null;
    }

    this.gallery.onPictureDownRemove = (item, index)=>{
      item.picture_down = null;
      item.picture_down_name =  null;
      item.picture.picture_down = null;
    }

    this.gallery.onItemClick = (item) => {
      this.item = item;
    }

    /** @type {import("../../typings/ResolvedPicture").ResolvedPicture} */
    this.item = null 

    this.buttons = {
      Close:()=>{

      },
      "Delete Picture" :()=>{
        if (!this.gallery.selectedItem) {
          Alert("Please selet a picture!");
          return false;
        }
        this.gallery.items = Objects.filter(this.gallery.items, f=> f.picN != this.gallery.selectedItem.picN);
        this.onRemovePicture(this.item.picture);
        return false;
      },
      "Add Picture":()=>{
        Prompt("Enter Picture Number",(val)=>{
          val = Number(val)
          var epic = this.gallery.items.find(f=>f.picN == val);
          if (epic) {
            Alert(`The picture number ${val} already exists!`);
            return false;
          }
          var pic = new PictureNode();
          pic.controllN = val;
          pic.picture_up = null;
          pic.picture_down = null;
          pic.region = this.region;
          pic.container = this.container;
          this.onAddPicture(pic);

          this.gallery.items.push({
            picN: pic.controllN,
            picture_up: null,
            picture_down: null,
            picture: pic
          })

        })
        return false;
      }
    }

  }

  /** @param {PictureNode} picture */
  onAddPicture(picture){

  }

  /** @param {PictureNode} picture */
  onRemovePicture(picture){

  }

  get template(){
    return this.extendTemplate(super.template, `<div>
  <div [component]="this.gallery">

  </div>
</div>`)
  }
}