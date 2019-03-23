export interface ISample {
    offset: number;
    url: string;
}

export class Sample implements ISample {
    public offset: number;
    public url: string;

    constructor(data: ISample) {
        this.offset = data.offset;
        this.url = data.url;
    }
}
