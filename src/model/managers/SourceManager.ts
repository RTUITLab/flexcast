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

  public async addSource(url: string) {
    const raw = await axios.get(url, { responseType: 'blob' });

    let arrayBuffer: ArrayBuffer;
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      arrayBuffer = (event.target as any).result;
      this._contextManager.context
        .decodeAudioData(arrayBuffer)
        .then((decoded) => {
          this._sources.push(new Source(url, decoded));

          bus.fire('sourcesChanged');
        });
    };
    fileReader.readAsArrayBuffer(raw.data);
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([raw.data], { type: 'application/octet-stream' })
    );

    //TODO: move config to .env file
    const beats = await axios.post<Beats>(
      'http://10.11.162.235:5000/api/naudio?offset=2',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    this.updateBeats(url, beats.data);
  }

  public updateBeats(name: string, beats: Beats) {
    const index = this._sources.findIndex((s) => s.name === name);
    if (index < 0) {
      return;
    }

    this._sources[index].beats = beats;
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
}
