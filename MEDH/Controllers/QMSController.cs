using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Text.Json;
using System.Text;

namespace MEDH.Controllers
{
    public class QMSController : Controller
    {

        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public QMSController(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }
        public IActionResult Qmsscreen()
        {
            return View();
        }
        public IActionResult Kiosk()
        {
            return View();
        }

        public async Task<IActionResult> LaySTTKiosk(string loai)
        {
            try
            {
                // Map mã phòng → tên quầy
                var phongMap = new Dictionary<int, string>
        {
            { 1, "Quầy tiếp đón 1" },
            { 2, "Quầy tiếp đón 2" },
            { 3, "Quầy tiếp chuyên gia 1" },
            { 4, "Quầy tiếp chuyên gia 2" }
        };

                int[] phongThuong = { 1, 2 };
                int[] phongDV = { 3, 4 };

                int maPhong;
                string quay;

                if (loai == "thuong")
                {
                    maPhong = phongThuong[new Random().Next(phongThuong.Length)];
                }
                else if (loai == "dv")
                {
                    maPhong = phongDV[new Random().Next(phongDV.Length)];
                }
                else
                {
                    return BadRequest(new { message = "Loại không hợp lệ. Hợp lệ: 'thuong' hoặc 'dv'" });
                }

                quay = phongMap.ContainsKey(maPhong) ? phongMap[maPhong] : "Không rõ";

                // Gọi Supabase RPC để lấy số thứ tự
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string functionUrl = $"{baseUrl}lay_so_thu_tu";

                var payload = new { ma_phong_input = maPhong };

                var request = new HttpRequestMessage(HttpMethod.Post, functionUrl)
                {
                    Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
                };

                request.Headers.Add("apikey", apiKey);
                request.Headers.Accept.Clear();
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var response = await _httpClient.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Không thể lấy số thứ tự từ Supabase",
                        status = (int)response.StatusCode,
                        detail = content
                    });
                }

                var json = JsonDocument.Parse(content).RootElement;

                if (!json.TryGetProperty("r_so_thu_tu", out var soThuTuElement))
                {
                    return BadRequest(new { message = "Phản hồi không chứa số thứ tự" });
                }

                var soThuTu = soThuTuElement.GetInt32();

                // Gọi tiếp function Supabase để lấy HTML phiếu STT
                string sttHtmlUrl = _configuration["SUPBASECONFIG:SupbaseFunctionURL"] + "phieu-stt";

                var htmlPayload = new
                {
                    so_thu_tu = soThuTu,
                    quay = quay
                };

                var htmlRequest = new HttpRequestMessage(HttpMethod.Post, sttHtmlUrl)
                {
                    Content = new StringContent(JsonSerializer.Serialize(htmlPayload), Encoding.UTF8, "application/json")
                };

                htmlRequest.Headers.Accept.Clear();
                htmlRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/html"));

                var htmlResponse = await _httpClient.SendAsync(htmlRequest);
                var htmlContent = await htmlResponse.Content.ReadAsStringAsync();

                if (!htmlResponse.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Không thể tạo HTML phiếu STT",
                        status = (int)htmlResponse.StatusCode,
                        detail = htmlContent
                    });
                }

                // Trả về cả số thứ tự và HTML phiếu
                return Ok(new
                {
                    html = htmlContent
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi xử lý server",
                    detail = ex.Message
                });
            }
        }


    }
}
