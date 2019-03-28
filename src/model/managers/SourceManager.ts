import axios from 'axios';

import { ContextManager } from './ContextManager';
import { Source } from '@/model/stuff/Source';
import { Beats } from '@/model/stuff/Beats';

import bus from '@/model/Bus';

/**
 * Class for handling new song on a TimeLine
 */
export class SourceHandle {
  /**
   * Source of the song
   */
  private _source: Source;

  /**
   * Get current Source
   */
  public get source(): Source {
    return this._source;
  }

  /**
   * Offset by X
   */
  public pageX: number;

  /**
   * Offset by Y
   */
  public pageY: number;

  constructor(source: Source, x: number, y: number) {
    this.pageX = x;
    this.pageY = y;
    this._source = source;
  }
}


/**
 * Class for managing resources.
 */
export class SourceManager {
  private _contextManager: ContextManager;

  private _sources: Source[] = [];
  private _sourceHandle: SourceHandle | null = null;

  constructor(contextManager: ContextManager) {
    this._contextManager = contextManager;
  }

  /**
   * Add new song from file or by link
   * @param inputSource url for file downloading or file itself
   */
  public async addSource(inputSource: string | File): Promise<void> {
    let raw: Blob;
    let name: string;

    if (typeof inputSource === 'string') {
      raw = (await axios.get(inputSource, { responseType: 'blob' })).data;
      name = inputSource;
    } else {
      raw = inputSource;
      name = inputSource.name;
    }

    const audioBuffer = await this.loadAudioBuffer(raw);
    const info = await this.processAudioBuffer(audioBuffer);

    const source = new Source(name, await this.loadAudioBuffer(raw));

    const N = 10;
    source.beats = new Beats(
      info.slice(0, N),
      info.slice(Math.max(info.length - N, 1))
    );
    this._sources.push(source);

    bus.fire('sourcesChanged');
  }

  public get sources(): Source[] {
    return this._sources;
  }

  /**
   * Start using new SourceHandle
   * @param handle handle which the will bew used
   */
  public startHandle(handle: SourceHandle): void {
    this._sourceHandle = handle;
    bus.fire('handleStarted');
  }

  /**
   * Clear current SourceHandle
   */
  public stopHandle(): void {
    this._sourceHandle = null;
    bus.fire('handleFinished');
  }

  /**
   * Update position of current SourceHandle
   * @param x position x
   * @param y position y
   */
  public moveHandle(x: number, y: number): void {
    if (this._sourceHandle == null) {
      return;
    }

    this._sourceHandle.pageX = x;
    this._sourceHandle.pageY = y;
    bus.fire('handleMoved');
  }

  public get sourceHandle(): SourceHandle | null {
    return this._sourceHandle;
  }

  public get hasHandle(): boolean {
    return this._sourceHandle != null;
  }

  /**
   * Function for decoding BLOB files to AudioBuffer
   * @param data audio file BLOB
   * @returns Decoded audio buffer
   */
  private async loadAudioBuffer(data: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        resolve((event.target as any).result);
      };

      fileReader.readAsArrayBuffer(data);
    });

    return await this._contextManager.context.decodeAudioData(arrayBuffer);
  }

  /**
   * Function for finding beats (peaks) in song
   * @param data Audio buffer of sound
   * @returns array of beat times, in seconds
   */
  private async processAudioBuffer(data: AudioBuffer): Promise<number[]> {
    const options = {
      numberOfChannels: data.numberOfChannels,
      length: data.length,
      sampleRate: data.sampleRate
    } as OfflineAudioContextOptions;

    const offlineContext = new OfflineAudioContext(options);

    const source = offlineContext.createBufferSource();
    source.buffer = data;

    const bandpass = offlineContext.createBiquadFilter();
    bandpass.type = 'bandpass';

    const lowFrequency = 60;
    const highFrequency = 130;

    bandpass.frequency.value = (highFrequency + lowFrequency) * 0.5;
    bandpass.Q.value =
      bandpass.frequency.value / (highFrequency - lowFrequency);
    source.connect(bandpass);
    bandpass.connect(offlineContext.destination);
    source.start(0);

    const result = await offlineContext.startRendering();

    const filteredData = result.getChannelData(0);
    const threshold = this.calculateThreshold(filteredData);

    const peaksArray: number[] = [];
    const length = data.length;
    for (let i = 0; i < length;) {
      if (filteredData[i] > threshold) {
        peaksArray.push(i / data.sampleRate);
        i += 10000;
      }
      i++;
    }

    return peaksArray;
  }

  private calculateThreshold(data: Float32Array): number {
    const { min, max } = data.reduce(
      (minMax, v) => {
        return {
          min: Math.min(minMax.min, v),
          max: Math.max(minMax.max, v)
        };
      },
      { min: data[0], max: data[0] }
    );

    // 0.8 is just a magic constant. For some songs it is 
    // enough, for another is it too low.
    // TODO: calculate this number from data
    return min + (max - min) * 0.8;
  }
}
