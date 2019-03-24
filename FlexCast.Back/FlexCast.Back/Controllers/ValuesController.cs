using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeatDetectorCSharp;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
//using RZP;

namespace FlexCast.Back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private readonly ILogger<ValuesController> logger;

        public ValuesController(ILogger<ValuesController> logger)
        {
            this.logger = logger;
        }
        // GET api/values
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public ActionResult<string> Get(int id)
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public async Task<IActionResult> Post(string pathToMusic)
        {
            var detector = BeatDetector.Instance();
            detector.loadSystem();
            detector.LoadSong(1024, pathToMusic);
            if (detector.getSongLength() < TimeSpan.FromSeconds(15))
                return BadRequest("Too short"); // Calc 10 seconds

            detector.setStarted(true);

            var result = new
            {
                head = (await GetBeats(detector, TimeSpan.FromSeconds(0), TimeSpan.FromSeconds(10))).Select(ts => ts.TotalMilliseconds),
                tail = (await GetBeats(detector, detector.getSongLength() - TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(10))).Select(ts => ts.TotalMilliseconds)
            };
            detector.setStarted(false);
            
            return new JsonResult(result);
        }


        async Task<List<TimeSpan>> GetBeats(BeatDetector detector, TimeSpan from, TimeSpan length)
        {
            detector.setPosition(from);
            var startbeats = new List<TimeSpan>();
            var current = from;
            TimeStamp last = default;
            while (detector.getPosition() < from + length && detector.isPlaying())
            {
                detector.update();
                if (last != detector.getLastBeat())
                {
                    if (last != default)
                        startbeats.Add(detector.getPosition());
                    last = detector.getLastBeat();
                }
                await Task.Delay(TimeSpan.FromMilliseconds(5));
            }
            return startbeats;
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
