import { DialogPage } from "leet-mvc/pages/DialogPage/DialogPage";
import "./LoadScreensetDialog.scss";

type DialogStep = "idle" | "invalid" | "ready";

export class LoadScreensetDialog extends DialogPage {
  /** List of .ssf filenames found in Screens/ (strings only — no handles in reactive array) */
  ssfFiles: string[] = [];

  rootHandle: FileSystemDirectoryHandle | null = null;

  /** Display name for the selected directory (handle.name) */
  dirName: string = "";

  /** Currently selected .ssf filename (bound to the dropdown) */
  selectedFileName: string = "";

  /** Inline validation / status message */
  message: string = "Click the Browse button to select your UCCNC installation directory.";

  /** Whether the message should be shown as an error */
  isError: boolean = false;

  /** Current dialog state */
  step: DialogStep = "idle";

  /** Callback invoked when a screenset is loaded successfully */
  onScreensetLoaded: (
    text: string,
    fileHandle: FileSystemFileHandle,
    uccncDirHandle: FileSystemDirectoryHandle
  ) => void = () => {};

  constructor(prefillHandle?: FileSystemDirectoryHandle | null) {
    super();
    this.title = "Load Screenset";
    this.classNames.push("page-LoadScreensetDialog");

    this.content = template;

    this.buttons = {
      Cancel: () => {
        /* close */
      },
      Load: () => {
        this._onLoadClicked();
        return false; // prevent auto-close; we close manually on success
      },
    };

    // If a saved handle was provided, scan it immediately after the dialog is rendered
    if (prefillHandle) {
      // Use setTimeout so the template has time to bind before we mutate reactive state
      setTimeout(() => {
        this._scanDirectory(prefillHandle);
      }, 0);
    }
  }

  /** Step 1: user clicks Browse to pick the UCCNC root directory */
  async onSelectDirectoryClicked() {
    try {
      const handle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker();
      if (!handle) return;
      await this._scanDirectory(handle);
    } catch (ex: any) {
      // User dismissed the picker — ignore silently
      if (ex?.name === "AbortError") return;
      this.isError = true;
      this.message = "Error accessing directory: " + ex.message;
    }
  }

  /** Validate & enumerate .ssf files from a given directory handle */
  private async _scanDirectory(handle: FileSystemDirectoryHandle) {
    this.rootHandle = handle;
    this.dirName = handle.name;

    // Validate: must contain a "Screens" child directory
    let screensHandle: FileSystemDirectoryHandle | null = null;
    try {
      screensHandle = await handle.getDirectoryHandle("Screens");
    } catch {
      // "Screens" not found
    }

    if (!screensHandle) {
      this.ssfFiles = [];
      this.selectedFileName = "";
      this.step = "invalid";
      this.isError = true;
      this.message =
        "This does not appear to be a valid UCCNC directory. It must contain a \"Screens\" subfolder.";
      return;
    }

    // Enumerate .ssf filenames from Screens/ (store names only, not handles)
    const files: string[] = [];
    for await (const [name, entry] of (screensHandle as any).entries()) {
      if (entry.kind === "file" && name.toLowerCase().endsWith(".ssf")) {
        files.push(name);
      }
    }

    files.sort((a, b) => a.localeCompare(b));

    this.ssfFiles = files;
    this.selectedFileName = "";
    this.step = "ready";
    this.isError = false;

    if (files.length === 0) {
      this.message =
        "No .ssf screenset files found in the Screens directory. Please make sure the correct directory is selected.";
    } else {
      this.message = `Found ${files.length} screenset(s). Please select one and click Load.`;
    }
  }

  /** Step 2: user clicks Load */
  async _onLoadClicked() {
    if (this.step !== "ready") {
      this.isError = true;
      this.message = "Please select your UCCNC directory first.";
      return;
    }
    if (!this.selectedFileName) {
      this.isError = true;
      this.message = "Please select a screenset from the list before clicking Load.";
      return;
    }

    try {
      // Re-fetch file handle from the Screens/ directory at load time.
      const screensHandle = await this.rootHandle!.getDirectoryHandle("Screens");
      const fileHandle = await screensHandle.getFileHandle(this.selectedFileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      this.onScreensetLoaded(text, fileHandle, this.rootHandle);
      this.destroy();
    } catch (ex: any) {
      this.isError = true;
      this.message = "Error loading screenset: " + ex.message;
    }
  }
}

const template = `
<div class="lsd-body">
  <p class="lsd-hint">
    Select your UCCNC installation directory (e.g. <code>C:\\UCCNC</code>).
    The editor will look for screenset files inside the <code>Screens</code> subfolder.
  </p>

  <div class="lsd-dir-row">
    <button class="btn btn-secondary lsd-dir-btn" onclick="this.onSelectDirectoryClicked()" title="Browse for UCCNC directory">
      <i class="fas fa-folder-open"></i>&nbsp;Browse
    </button>
    <div class="lsd-dir-path" [class.lsd-dir-path--empty]="!this.dirName">
      {{this.dirName || "— no directory selected —"}}
    </div>
  </div>

  <div class="lsd-message" [if]="this.message" [error]="this.isError">
    {{this.message}}
  </div>

  <div class="lsd-dropdown-block" [if]="this.step === 'ready' && this.ssfFiles.length > 0">
    <label class="lsd-label">Select Screenset:</label>
    <select class="lsd-select" bind="this.selectedFileName">
      <option value="">— please select —</option>
      <option [foreach]="this.ssfFiles as fileName" [value]="fileName">{{fileName}}</option>
    </select>
  </div>
</div>
`;
