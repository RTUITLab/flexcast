export class ContextManager {
  private _context = new AudioContext();

  public get context() {
    return this._context;
  }
}
