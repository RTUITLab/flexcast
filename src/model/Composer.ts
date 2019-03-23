import { Sample } from './Sample';
import axios from 'axios';

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
        setInterval(() => console.log("aed"), 1000);
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

    async loadDogSound(url: string, offset: number) {

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';


        request.onload = () => {
            this.context.decodeAudioData(request.response, buffer => {
                const source = this.context.createBufferSource();
                source.buffer = buffer;
                source.connect(this.context.destination);
                source.start();
                console.log(buffer.length);
            }, e => console.log(e));
        }
        request.send();
    }


    /**
     * Appends two ArrayBuffers into a new one.
     * 
     * @param {ArrayBuffer} data The ArrayBuffer that was loaded.
     */
    private play(data: any) {
        //decode the loaded data
        this.context.decodeAudioData(data, (buf) => {
            var audioSource = this.context.createBufferSource();
            audioSource.connect(this.context.destination);
            audioSource.buffer = buf;
            audioSource.playbackRate.value = 1;
        });

    };
}
