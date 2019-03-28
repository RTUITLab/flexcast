/**
 * Class for sorting AudioContext
 */
export class ContextManager {
  private _context = new AudioContext();
  /**
   * Get current AudioContext
   */
  public get context(): AudioContext {
    return this._context;
  }
}
