export const FileHelpers = {
  verifyPermission(fileHandle, readWrite) {
    const options = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    // Check if permission was already granted. If so, return true.
    return fileHandle.queryPermission(options).then(res=> {
      if (res == 'granted')
        return fileHandle
      else
        return fileHandle.requestPermission(options).then(res=> {
          if (res == 'granted')
            return fileHandle
          else
            return false
        })  
    }).catch(err =>{
      return false;
    })
  },

  async saveCanvasToFileHandle(canvas, fileHandle){
    if (await FileHelpers.verifyPermission(fileHandle, true)){
      var writable = await fileHandle.createWritable();
      canvas.toBlob(async (blob)=>{
        await writable.write(blob);
        writable.close();
      })
    }
  },

  async writeTextToFileHandle(text, fileHandle){
    if (fileHandle && await FileHelpers.verifyPermission(fileHandle, true)){
      var writable = await fileHandle.createWritable();
      await writable.write(text);
      writable.close();
    }
  },

  async getDirectoryFileContents(dirHandle, fileName){
    var fileHandle = await dirHandle.getFileHandle(fileName);
    var file = await fileHandle.getFile();
    var reader = new FileReader()

    return new Promise(function(resolve){
      reader.onload = (e)=>{
        resolve(e.target.result)
      }
      reader.readAsDataURL(file);
    })
  },

  /**
   * @return {Promise<{fileHandle:any, file:File, contents: string | ArrayBuffer}>}
   */
  async selectFileFromDiskGetContents(){
    var [fileHandle] = await window.showOpenFilePicker();
    var file = await fileHandle.getFile();
    var reader = new FileReader();
    return new Promise(function(resolve){
      reader.onload = (e)=>{
        resolve({fileHandle, file, contents: e.target.result})
      }
      reader.readAsDataURL(file);
    })
  }
}