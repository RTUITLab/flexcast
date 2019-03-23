export class Composer {

    private context = new AudioContext();

    public Test() {
        this.loadDogSound('https://files.rtuitlab.ru/subaru.mp3');
        return;
    }

    loadDogSound(url:string ) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
      
        // Decode asynchronously
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
