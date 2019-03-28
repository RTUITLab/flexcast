type BusEvent =
  | 'sourcesChanged'
  | 'samplesChanged'
  | 'ppsChanged'
  | 'volumeChanged'
  | 'windowSliceChanged'
  | 'playPause'
  | 'playing'
  | 'seeked'
  | 'handleStarted'
  | 'handleFinished'
  | 'handleMoved'
  | 'scrollToCursor'
  | 'instrumentChanged';

type BusEventHandler = () => void;

/**
 * General events bus
 */
export class Bus {
  private _listeners: Map<BusEvent, BusEventHandler[]> = new Map();

  /**
   * Subscribe to event
   * @param event Type of event
   * @param handler Handler function
   */
  public on(event: BusEvent, handler: BusEventHandler): void {
    const listeners = this._listeners.get(event);
    this._listeners.set(event, (listeners || []).concat(handler));
  }

  /**
   * Remove handler from event
   * @param event Type of event
   * @param handler Handler to remove
   */
  public off(event: BusEvent, handler: BusEventHandler): void {
    const listeners = this._listeners.get(event);

    if (listeners == null) {
      return;
    }

    this._listeners.set(event, listeners.filter((v) => v !== handler));
  }

  /**
   * Fire event
   * @param event Type of fire event
   */
  public fire(event: BusEvent): void {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.forEach((v) => v());
    }
  }
}

/**
 * Singleton bus for all application
 */
const bus = new Bus();
export default bus;
