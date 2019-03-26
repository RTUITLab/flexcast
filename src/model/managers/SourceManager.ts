import axios from 'axios';

import { ContextManager } from './ContextManager';
import { Source } from '@/model/stuff/Source';
import { Beats } from '@/model/stuff/Beats';

import bus from '@/model/Bus';

export class SourceHandle {
  public pageX: number;
  public pageY: number;
  private _source: Source;

  constructor(source: Source, x: number, y: number) {
    this.pageX = x;
    this.pageY = y;
    this._source = source;
  }

  public get source() {
    return this._source;
  }
}

export class SourceManager {
  private _contextManager: ContextManager;

  private _sources: Source[] = [];
  private _sourceHandle: SourceHandle | null = null;

  constructor(contextManager: ContextManager) {
    this._contextManager = contextManager;
  }

  public async addSource(inputSource: string | File) {
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

    const N = 20;
    source.beats = new Beats(
      info.slice(0, N),
      info.slice(Math.max(info.length - N, 1))
    );
    this._sources.push(source);

    bus.fire('sourcesChanged');
  }

  public get sources() {
    return this._sources;
  }

  public startHandle(handle: SourceHandle) {
    this._sourceHandle = handle;
    bus.fire('handleStarted');
  }

  public stopHandle() {
    this._sourceHandle = null;
    bus.fire('handleFinished');
  }

  public moveHandle(x: number, y: number) {
    if (this._sourceHandle == null) {
      return;
    }

    this._sourceHandle.pageX = x;
    this._sourceHandle.pageY = y;
    bus.fire('handleMoved');
  }

  public get sourceHandle() {
    return this._sourceHandle;
  }

  public get hasHandle() {
    return this._sourceHandle != null;
  }

  private async loadAudioBuffer(data: Blob) {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        resolve((event.target as any).result);
      };

      fileReader.readAsArrayBuffer(data);
    });

    return await this._contextManager.context.decodeAudioData(arrayBuffer);
  }

  private async processAudioBuffer(data: AudioBuffer) {
    const options = {
      numberOfChannels: data.numberOfChannels,
      length: data.length,
      sampleRate: data.sampleRate
    } as OfflineAudioContextOptions;

    const offlineContext = new OfflineAudioContext(options);

    const source = offlineContext.createBufferSource();
    source.buffer = data;

    const LPF = offlineContext.createBiquadFilter();
    LPF.type = 'lowpass';
    source.connect(LPF);
    LPF.connect(offlineContext.destination);
    source.start(0);

    const result = await offlineContext.startRendering();

    const filteredData = result.getChannelData(0);
    const threshold = this.calculateThreshold(filteredData);

    const peaksArray: number[] = [];
    const length = data.length;
    for (let i = 0; i < length; ) {
      if (filteredData[i] > threshold) {
        peaksArray.push(i / data.sampleRate);
        i += 10000;
      }
      i++;
    }

    return peaksArray;
  }

  private calculateThreshold(data: Float32Array) {
    const { min, max } = data.reduce(
      (minMax, v) => {
        return {
          min: Math.min(minMax.min, v),
          max: Math.max(minMax.max, v)
        };
      },
      { min: data[0], max: data[0] }
    );

    return min + (max - min) * 0.8;
  }
}
