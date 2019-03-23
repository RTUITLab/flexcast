import { Sample } from './Sample';
import axios from 'axios';
import { analyze } from 'web-audio-beat-detector';
import { Analyzer } from './Analyzer';



export class Composer {
    private context = new AudioContext();

    public async Run(samples: Sample[]) {

        const downloaded = samples.map(s => {
            return {
                sample: s,
                promise: axios.get(s.url, { responseType: 'arraybuffer' })
            }
        });
        var downloadTasks = await Promise.all(downloaded.map(a => a.promise.then(r => this.context.decodeAudioData(r.data))));
        setInterval(() => console.log("timer"), 1000);
        for (let index = 0; index < downloadTasks.length; index++) {
            const element = downloadTasks[index];
            var myanalyser = new Analyzer(this.context, element);
            const beats = await myanalyser.Analyze(10);
            console.log(beats);
        }
        return;
    }
}
