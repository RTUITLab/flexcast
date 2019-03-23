let CURRENT_ID: number = 0;

export interface ISample {
  id: number;
  url: string;
  offset: number;
  duration: number;
}

export class Sample implements ISample {
  public id: number;
  public url: string;
  public offset: number;
  public duration: number = 0;

  constructor(url: string, offset: number) {
    this.id = CURRENT_ID++;
    this.url = url;
    this.offset = offset;
  }

  get isComplete() {
    return this.duration > 0;
  }
}
