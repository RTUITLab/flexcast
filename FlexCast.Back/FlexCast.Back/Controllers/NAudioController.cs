using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeatDetectorCSharp;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RZP;
//using RZP;

namespace FlexCast.Back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NAudioController : ControllerBase
    {
        private readonly ILogger<ValuesController> logger;

        public NAudioController(ILogger<ValuesController> logger)
        {
            this.logger = logger;
        }

        // POST api/naudio
        [HttpPost]
        public async Task<IActionResult> Post(IFormFile file, int offset = 5)
        {
            var detected = NAudioDetector.Detect(offset, file.OpenReadStream());
            return new JsonResult(detected);
        }
    }
}
