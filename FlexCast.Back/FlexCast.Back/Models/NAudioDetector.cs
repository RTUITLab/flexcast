using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using NAudio.Wave;

namespace RZP
{

    class Beats
    {
        public List<double> Head { get; set; } = new List<double>();
        public List<double> Tail { get; set; } = new List<double>();
    }

    class NAudioDetector
    {
        public static Beats Detect(int offset, Stream stream)
        {
            short[] leftChn;
            short[] rightChn;
            using (WaveStream reader = new Mp3FileReader(stream))
            {
                byte[] buffer = new byte[reader.Length];
                int read = reader.Read(buffer, 0, buffer.Length);
                short[] sampleBuffer = new short[read / 2];
                Buffer.BlockCopy(buffer, 0, sampleBuffer, 0, read);

                List<short> chan1 = new List<short>();
                List<short> chan2 = new List<short>();

                for (int i = 0; i < sampleBuffer.Length; i += 2)
                {
                    chan1.Add(sampleBuffer[i]);
                    chan2.Add(sampleBuffer[i + 1]);
                }

                leftChn = chan1.ToArray();
                rightChn = chan2.ToArray();
            }

            double sampleRate = 44100;

            double trackLength = (float)leftChn.Length / sampleRate;

            // 0.1s window ... 0.1*44100 = 4410 samples, lets adjust this to 3600 
            int sampleStep = 3600;

            // calculate energy over windows of size sampleSetep
            List<double> energies = new List<double>();
            for (int i = 0; i < leftChn.Length - sampleStep - 1; i += sampleStep)
            {
                energies.Add(rangeQuadSum(leftChn, i, i + sampleStep));
            }

            double average = 0;
            double sumOfSquaresOfDifferences = 0;
            double variance = 0;
            double newC = 0;
            List<double> variances = new List<double>();

            // how many energies before and after index for local energy average
            var beats = new Beats();
            double last = -10;
            for (int i = offset; i <= energies.Count - offset - 1; i++)
            {
                var time = trackLength / energies.Count * i;
                if (time > 10 && time < trackLength - 10)
                    continue;
                // calculate local energy average
                double currentEnergy = energies[i];
                double qwe = rangeSum(energies.ToArray(), i - offset, i - 1) + currentEnergy + rangeSum(energies.ToArray(), i + 1, i + offset);
                qwe /= offset * 2 + 1;

                // calculate energy variance of nearby energies
                List<double> nearbyEnergies = energies.Skip(i - 5).Take(5).Concat(energies.Skip(i + 1).Take(5)).ToList<double>();
                average = nearbyEnergies.Average();
                sumOfSquaresOfDifferences = nearbyEnergies.Select(val => (val - average) * (val - average)).Sum();
                variance = (sumOfSquaresOfDifferences / nearbyEnergies.Count) / Math.Pow(10, 22);

                // experimental linear regression - constant calculated according to local energy variance
                newC = variance * 0.009 + 1.385;
                if (currentEnergy > newC * qwe && time - last > 0.35)
                {
                    last = time;
                    if (time > 10)
                        beats.Tail.Add(time);
                    else
                        beats.Head.Add(time);
                }
            }
            //Clean(beats.Head);
            //Clean(beats.Tail);
            return beats;
        }


        private static void Clean(List<double> times)
        {
            if (times.Count < 3)
                return;
            if (times[1] - times[0] < (times[2] - times[1]) * 2)
            {
                var averrage = (times[0] + times[1]) / 2;
                times.RemoveRange(0, 2);
                times.Insert(0, averrage);
            }
            for (int i = 1; i < times.Count - 1; i++)
            {
                if ((times[i] - times[i - 1]) < (times[i + 1] - times[i]) * 2)
                {
                    var averrage = (times[i] + times[i + 1]) / 2;
                    times.RemoveRange(i, 2);
                    times.Insert(i, averrage);
                }
            }
        }

        private static double rangeQuadSum(short[] samples, int start, int stop)
        {
            double tmp = 0;
            for (int i = start; i <= stop; i++)
            {
                tmp += Math.Pow(samples[i], 2);
            }

            return tmp;
        }

        private static double rangeSum(double[] data, int start, int stop)
        {
            double tmp = 0;
            for (int i = start; i <= stop; i++)
            {
                tmp += data[i];
            }

            return tmp;
        }
    }
}