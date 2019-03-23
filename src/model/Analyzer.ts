import { analyze } from 'web-audio-beat-detector';

export class Analyzer {

    private beats = new Beats([], []);

    constructor(private context: AudioContext, private data: AudioBuffer) {
    }

    public Analyze(seconds: number): Promise<Beats> {

        const headPart = this.context.createBufferSource();
        headPart.buffer = this.data;
        const tailPart = this.context.createBufferSource();
        tailPart.buffer = this.data;

        const headAnalyzer = this.context.createAnalyser();
        const tailAnalyzer = this.context.createAnalyser();
        headPart.connect(headAnalyzer);
        tailPart.connect(tailAnalyzer);
        tailAnalyzer.connect(this.context.destination);
        const headPromise = this.AnalyzeInternal(
            headPart,
            headAnalyzer,
            0);
        const tailPromise = this.AnalyzeInternal(
            tailPart,
            tailAnalyzer,
            this.data.duration - seconds
        );
        console.log(this.data.duration);
        return Promise.all([headPromise, tailPromise]).then(args => new Beats(args[0], args[1]));
    }

    private AnalyzeInternal(
        source: AudioBufferSourceNode,
        analyser: AnalyserNode,
        offset: number
    ): Promise<number[]> {
        return new Promise((res, rej) => {
            const dateNow = Date.now();
            const now = dateNow;
            const alg = new Algorithm(result => res(result.map(b => (b - now)+(offset * 1000))), rej, analyser, Date.now() + 10000);
            requestAnimationFrame(() => alg.update());
            source.start(0, offset);
        });
    }
}

class Algorithm {

    constructor(
        private resolve: (arg: number[]) => void,
        private reject: (reason: any) => void,
        private analyser: AnalyserNode,
        private end: number) {
        this.previousFFT = new Float32Array(analyser.frequencyBinCount);
    }

    private beats: number[] = [];

    private previousFFT: Float32Array;

    private specFlux: number = 0;
    private timeBetween: number = 0;

    private spectrumFluxes: number[] = [];
    private smootherValues: number[] = [];
    private thresholdSmoother = 0.6;

    private getCurrentSpectrum(): Float32Array {
        const array = new Float32Array(this.analyser.frequencyBinCount);
        this.analyser.getFloatFrequencyData(array);
        return array;
    }

    private calculateFluxAndSmoothing(currentSpectrum: Float32Array): number {

        this.specFlux = 0.0;

        //Calculate differences
        for (let i = 0; i < this.analyser.frequencyBinCount / 2; i++) {
            const difference = currentSpectrum[i] - this.previousFFT[i];

            if (difference > 0) {
                this.specFlux += difference;
            }
        }

        let median = 0;
        let smoothMedian = 0;

        if (this.spectrumFluxes.length > 0 && this.spectrumFluxes.length < 10) {
            this.spectrumFluxes.sort();
            this.smootherValues.sort();

            if (this.spectrumFluxes[this.spectrumFluxes.length / 2] > 0) {
                median = this.spectrumFluxes[this.spectrumFluxes.length / 2];
            }

            if (this.smootherValues.length > 0 && this.smootherValues.length < 5) {

                if (this.smootherValues[this.smootherValues.length / 2] > 0) {
                    smoothMedian = this.smootherValues[this.smootherValues.length / 2];
                }
            }
        }

        for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
            if (this.spectrumFluxes.length > 1)
                this.spectrumFluxes.splice(this.spectrumFluxes.length - 1, 0, this.specFlux);
            else
                this.spectrumFluxes.splice(this.spectrumFluxes.length, 0, this.specFlux);

            if (this.spectrumFluxes.length >= 10) {
                this.spectrumFluxes.shift();
            }
        }

        //Copy spectrum for next spectral flux calculation
        for (let j = 0; j < this.analyser.frequencyBinCount; j++)
            this.previousFFT[j] = currentSpectrum[j];

        if (smoothMedian > 1)
            this.thresholdSmoother = 0.8;
        if (smoothMedian > 2 && smoothMedian < 4)
            this.thresholdSmoother = 1.0;
        if (smoothMedian > 4 && smoothMedian < 6)
            this.thresholdSmoother = 2.2;
        if (smoothMedian > 6)
            this.thresholdSmoother = 2.4;

        return this.thresholdSmoother + median;
    }


    public update(): void {

        if (Date.now() > this.end)
            this.resolve(this.beats);

        const specStereo = this.getCurrentSpectrum();


        const beatThreshold = this.calculateFluxAndSmoothing(specStereo);

        if (this.specFlux > beatThreshold && (Date.now() - this.timeBetween) > 350) {
            if (this.smootherValues.length > 1)
                this.smootherValues.splice(this.smootherValues.length - 1, 0, this.specFlux);
            else
                this.smootherValues.splice(this.smootherValues.length, 0, this.specFlux);

            if (this.smootherValues.length >= 5) {
                this.smootherValues.shift();
            }

            this.timeBetween = Date.now();


            this.beats.push(Date.now())
        }
        else if ((Date.now() - this.timeBetween) > 5000) {
            if (this.thresholdSmoother > 0.4)
                this.thresholdSmoother -= 0.4;

            this.timeBetween = Date.now();
        }
        requestAnimationFrame(() => this.update());
    }
}

export class Beats {
    constructor(public head: number[], public tail: number[]) {
    }
}