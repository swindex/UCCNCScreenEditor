import { Objects } from "leet-mvc/core/Objects";
import { Text } from "leet-mvc/core/text";
import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import "./FileSystemFilePicker.scss";

interface FileItem {
  icon:string,
  name:string,
  handle:FileSystemDirectoryHandle | FileSystemFileHandle,
  parentHandle:FileSystemDirectoryHandle
}

export class FileSystemFilePicker extends DialogPage {
  dirHandle: FileSystemDirectoryHandle = null;
  items: FileItem[] = [];
  filteredItems: FileItem[] = [];

  path: FileItem[] = [];
  selectedDirItem: FileItem = null;
  selectedItem: FileItem = null;

  searchText: string = null;

  constructor(dirHandle: FileSystemDirectoryHandle, title?: string){
    super();

    this.title = title;
    this.classNames.push("page-FileSystemFilePicker");

    this.dirHandle = dirHandle;
 
    this.buttons = {
      Close: ()=>{
        this.onCancelClicked();
      },
      Select: ()=>{
        if (!this.selectedItem)
          return false;

        this.path.shift();  
        var path =  Objects.map(this.path, f=>f.name).join("/");
        this.selectedItem.path = path;
        this.onFileSelected(this.selectedItem);
      }
    }

    this.getDirContents({ handle: this.dirHandle });
  }

  /** @override */
  onFileSelected(file: FileItem){

  }

  /** @override */
  onCancelClicked(){}

  /*searchTextChange(val){
    if (typeof val == "symbol") return;
    this.filter(val);
  }*/

  filter(val){
    if (!val) {
      this.filteredItems = this.items;
      return;
    }
    var reg = new RegExp(val, "ig");
    this.filteredItems = Objects.filter(this.items, item=>item.name.match(reg));
  }

  async getDirContents(item: FileItem){
    var items = []
    if (item.parentHandle) {
      items.push({
        icon: this.getIcon("", item.parentHandle.kind),
        name:"..",
        handle: null,
        parentHandle: null
      });
    }
    for await (let [name, handle] of item.handle.entries()) {
      items.push({
        icon: this.getIcon(name, handle.kind),
        name:name,
        handle: handle,
        parentHandle :  item.handle
      });
    }



    this.path.push(item);
    this.items = items;
    this.filter(this.searchText);
  }

  getIcon(name, kind){
    if (kind=="directory") {
      return "fas fa-folder";
    }
    var ext = Text.fileExtension(name);
    switch (ext.toUpperCase()) {
      case "JPG":
      case "JPGEG":
      case "PNG":
      case "BMP":
        return "fas fa-file-image";
      case "SSF":
        return "fas fa-file-code"
      default:
        return "fas fa-file"
    }
  }

  async onItemClicked(item: FileItem, index: number){
    if (item.handle == null) {
      this.path.pop();
      var item = this.path.pop();
      this.selectedItem = null;
      await this.getDirContents(item);
      //go Up
    } else if (item.handle.kind == "file") {
      this.selectedItem = item;
    } else {
      this.selectedItem = null;
      await this.getDirContents(item);
    }
  }

  get template(){
    return this.extendTemplate(super.template, template);
  }

  isSelectedItem(item){
    if (this.selectedItem && item?.handle == this.selectedItem?.handle) {
      return true;
    }
  }
}


const template = `
<div class="searchblock">
  <div class="fieldgroup">
    <div class="fieldrow">
      <input type="text" bind="this.searchText" placeholder="Search text.." oninput="this.filter(this.searchText)">
      <div class="icon"><i class="fas fa-search"></i></div>
    </div>
   </div> 
</div>
<div class="list">
  <div class="item" [foreach]="this.filteredItems as item" onclick="this.onItemClicked(item, index)" [selected]="this.isSelectedItem(item)">
    <div class="icon"><i [class]="item.icon"></i></div>
    <div class="name">{{item.name}}</div>
  </div>
</div>
`;