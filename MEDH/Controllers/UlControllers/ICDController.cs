using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace MEDH.Controllers.UlControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ICDController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public ICDController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpGet("{code}")]
        public async Task<IActionResult> GetICD(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest("ICD code is required.");

            var url = $"http://icd10api.com/?s={code}&desc=short&r=json";

            try
            {
                var response = await _httpClient.GetAsync(url);

                var content = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"ICD API Response for '{code}': {content}");

                response.EnsureSuccessStatusCode();


                var json = await response.Content.ReadAsStringAsync();
                return Content(json, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, $"Failed to fetch ICD data: {ex.Message}");
            }
        }
    }
}
