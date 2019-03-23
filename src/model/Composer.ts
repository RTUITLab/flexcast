import { Sample } from './Sample';
import axios from 'axios';

export class Composer {
  private context = new AudioContext();

  public async Run(samples: Sample[]) {
    const downloaded = samples.map((s) => {
      return {
        sample: s,
        promise: axios.get(s.url, { responseType: 'arraybuffer' })
      };
    });
    const downloadTasks = await Promise.all(
      downloaded.map((a) =>
        a.promise.then((r) => this.context.decodeAudioData(r.data))
      )
    );

    for (let index = 0; index < downloadTasks.length; index++) {
      const element = downloadTasks[index];
      const source = this.context.createBufferSource();
      source.buffer = element;
      source.connect(this.context.destination);
      console.log(samples[index].offset);
      source.start(samples[index].offset);
    }
    return;
  }
}
