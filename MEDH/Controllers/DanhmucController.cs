using MEDH.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace MEDH.Controllers
{
    public class DanhmucController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public DanhmucController(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }


        public IActionResult Danhmuc()
        {
            return View();
        }

        //THUỐC -----------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Danhmucthuoc()
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURLv1"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}thuoc?select=ma_thuoc,ten_thuoc,don_vi,don_gia,thanh_toan";

                Console.WriteLine(requestUrl);
                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");

                var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Không lấy được danh sách thuốc",
                        status = response.StatusCode,
                        detail = responseContent
                    });
                }

                var danhSachThuoc = JsonSerializer.Deserialize<List<ThuocDTO>>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return Json(danhSachThuoc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi xử lý Danhmucthuoc",
                    detail = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Adddanhmucthuoc([FromBody] ThuocDTO thuoc)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURLv1"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}thuoc";

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
           
                request.Headers.Add("apikey", apiKey);
        
                request.Headers.Add("Prefer", "return=representation");

                
                var payload = new
                {
                    ten_thuoc = thuoc.TenThuoc,
                    don_vi = thuoc.DonVi,
                    don_gia = thuoc.DonGia,
                    thanh_toan = thuoc.ThanhToan,
                    so_luong_ton = 0
                };
                Console.WriteLine(payload);

                var json = JsonSerializer.Serialize(payload);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Không thể thêm thuốc",
                        status = response.StatusCode,
                        detail = responseContent
                    });
                }

                return Content(responseContent, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi xử lý khi thêm thuốc",
                    detail = ex.Message
                });
            }
        }

        //NHÂN VIÊN -------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Danhmucnhanvien()
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURLv1"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}nhanvien";

                Console.WriteLine(requestUrl);
                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");

                var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine(responseContent);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Không lây được danh mục nhân viên",
                        status = response.StatusCode,
                        detail = responseContent
                    });
                }

                var danhSachThuoc = JsonSerializer.Deserialize<List<NhanvienDTO>>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return Json(danhSachThuoc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi xử lý Danhmucnhanvien",
                    detail = ex.Message
                });
            }
        }

        //DỊCH VỤ ----------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> Danhmucdichvu(string loaidichvu)
        {
            try
            {
                string endpoint = loaidichvu switch
                {
                    "kham" => "dichvu?loai_dich_vu=eq.kham",
                    "xet_nghiem" => "dichvu?loai_dich_vu=eq.xet_nghiem",
                    "chan_doan" => "dichvu?loai_dich_vu=eq.chan_doan",
                    "pttt" => "dichvu?loai_dich_vu=eq.pttt",
                    _ => throw new ArgumentException("Loại dịch vụ không hợp lệ", nameof(loaidichvu))
                };

                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURLv1"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];

                string requestUrl = $"{baseUrl}{endpoint}";
                Console.WriteLine(requestUrl);
                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");

                var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine(responseContent);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Không lấy được danh mục dich vụ",
                        status = response.StatusCode,
                        detail = responseContent
                    });
                }

                var danhSachDichvu = JsonSerializer.Deserialize<List<DichvuDTO>>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return Json(danhSachDichvu);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi xử lý Dahmucdichvu",
                    detail = ex.Message
                });
            }
        }
    }
}
