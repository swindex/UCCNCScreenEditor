import { get, set, del } from "idb-keyval";
import { FileHelpers } from "./FileHelpers";

const IDB_KEY = "uccncDirHandle";

/**
 * Manages the UCCNC root directory handle.
 *
 * Use `getHandle()` everywhere you need `uccncDirHandle` – it will:
 *   1. Return the in-memory cached handle if permission is still valid.
 *   2. Try to restore the persisted handle from IndexedDB and re-verify / re-request permission.
 *   3. Fall back to `showDirectoryPicker()` if permission cannot be restored.
 *   4. Return `null` when the user cancels or permission is permanently denied.
 */
export const UccncDirHandleManager = {
  /** In-memory cache so we don't hit IDB on every call. */
  _handle: null as FileSystemDirectoryHandle | null,

  /**
   * Returns a directory handle that is guaranteed to have readwrite permission,
   * or `null` if the user cancelled / permission was denied.
   *
   * @param allowPicker - When `true` (default), the browser directory picker will
   *   be shown if the stored handle has no valid permission.  Pass `false` if you
   *   only want to check / restore an existing handle without prompting.
   */
  async getHandle(allowPicker = true): Promise<FileSystemDirectoryHandle | null> {
    // 1. Check the in-memory cache first.
    if (this._handle) {
      const ok = await FileHelpers.verifyPermission(this._handle, true);
      if (ok) return this._handle;
      // Permission expired – drop the cache and fall through.
      this._handle = null;
    }

    // 2. Try to restore from IDB.
    let stored: FileSystemDirectoryHandle | undefined;
    try {
      stored = await get<FileSystemDirectoryHandle>(IDB_KEY);
    } catch {
      stored = undefined;
    }

    if (stored) {
      const ok = await FileHelpers.verifyPermission(stored, true);
      if (ok) {
        this._handle = stored;
        return this._handle;
      }
      // Stored handle exists but permission was denied (e.g. browser restart).
      // Fall through to picker so the user can re-grant access.
    }

    // 3. Show the directory picker if allowed.
    if (!allowPicker) return null;

    try {
      const picked: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      await this.setHandle(picked);
      return this._handle;
    } catch {
      // User cancelled the picker.
      return null;
    }
  },

  /**
   * Persists a new directory handle to IDB and updates the in-memory cache.
   * Call this whenever the user picks a new UCCNC directory.
   */
  async setHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    this._handle = handle;
    try {
      await set(IDB_KEY, handle);
    } catch (err) {
      console.warn("UccncDirHandleManager: could not persist handle to IDB", err);
    }
  },

  /**
   * Clears the persisted handle from IDB and the in-memory cache.
   */
  async clearHandle(): Promise<void> {
    this._handle = null;
    try {
      await del(IDB_KEY);
    } catch (err) {
      console.warn("UccncDirHandleManager: could not clear handle from IDB", err);
    }
  },

  /**
   * Returns the raw handle from IDB **without** requesting any permission.
   * Useful for pre-filling dialogs where we only want to show a directory name.
   */
  async peekHandle(): Promise<FileSystemDirectoryHandle | null> {
    if (this._handle) return this._handle;
    try {
      return (await get<FileSystemDirectoryHandle>(IDB_KEY)) ?? null;
    } catch {
      return null;
    }
  },
};
