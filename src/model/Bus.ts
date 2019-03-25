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

class Bus {
  private _listeners: Map<BusEvent, BusEventHandler[]> = new Map();

  public on(event: BusEvent, handler: BusEventHandler) {
    const listeners = this._listeners.get(event);
    this._listeners.set(event, (listeners || []).concat(handler));
  }

  public off(event: BusEvent, handler: BusEventHandler) {
    const listeners = this._listeners.get(event);

    if (listeners == null) {
      return;
    }

    this._listeners.set(event, listeners.filter((v) => v !== handler));
  }

  public fire(event: BusEvent) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.forEach((v) => v());
    }
  }
}

const bus = new Bus();
export default bus;
