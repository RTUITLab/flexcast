import { Rectangle } from './Rectangle';

export class PlayerManager {
  private _windowRectangle: Rectangle = new Rectangle();

  private _isPlaying: boolean = false;

  private _time: number = 0;
  private _lastTimestamp: number = -1;
}
