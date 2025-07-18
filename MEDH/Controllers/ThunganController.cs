﻿using MEDH.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;

namespace MEDH.Controllers
{
    public class ThunganController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ThunganController(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }
        public async Task<IActionResult> Dsphieuthu()
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "lay_danh_sach_nb_phieu_thu_tat_toan";

                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = $"❌ Lỗi từ Supabase: {error}";
                    return View(new List<DanhSachPhieuThuTatToan>());
                }

                var jsonResult = await response.Content.ReadAsStringAsync();

                var danhSach = JsonSerializer.Deserialize<List<DanhSachPhieuThuTatToan>>(jsonResult, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return View(danhSach);
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Lỗi xử lý controller: {ex.Message}";
                return View(new List<DanhSachPhieuThuTatToan>());
            }
        }

        public async Task<IActionResult> Quanlytamung()
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "lay_danh_sach_nb_tam_ung";

                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    ViewBag.ErrorMessage = $"❌ Lỗi từ Supabase: {error}";
                    return View(new List<DanhSachTamUngViewModel>());
                }

                var jsonResult = await response.Content.ReadAsStringAsync();

                var danhSach = JsonSerializer.Deserialize<List<DanhSachTamUngViewModel>>(jsonResult, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return View(danhSach);
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = $"Lỗi xử lý controller: {ex.Message}";
                return View(new List<DanhSachTamUngViewModel>());
            }
        }


        public IActionResult Dshoandoi()
        {
            return View();
        }

        public async Task<IActionResult> Chitietphieuthu(string maHS)
        {
            if (!int.TryParse(maHS, out int maDotKham))
                return BadRequest("Mã hồ sơ không hợp lệ.");

            string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
            string apiKey = _configuration["SUPBASECONFIG:apikey"];
            string url = baseUrl + "chi_tiet_tat_toan";

            var payload = new { ma_dot_kham_input = maDotKham };
            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("apikey", apiKey);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return BadRequest("Không lấy được dữ liệu từ hệ thống.");

            var jsonStr = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<ChiTietTatToanViewModel>(jsonStr, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result == null || result.Satus != "success" || result.Data == null)
                return BadRequest("Không tìm thấy thông tin phiếu thu.");

            return View(result.Data);
        }

        // Chi tiết tạm ưn
        public async Task<IActionResult> ChitietTamUng(string maHS)
        {
            Console.WriteLine(maHS);
            string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
            string apiKey = _configuration["SUPBASECONFIG:apikey"];
            string url = baseUrl + "chi_tiet_tam_ung";

            var payload = new { ma_dot_kham_input = maHS };
            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("apikey", apiKey);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return BadRequest("Không lấy được dữ liệu tạm ứng");

            var jsonStr = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<ChiTietTamUngViewModel>(jsonStr, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            // Kiểm tra dữ liệu trả về
            if (data == null || data.Data == null || data.Status?.ToLower() != "success")
            {
                return NotFound("Không tìm thấy thông tin tạm ứng cho hồ sơ này.");
            }

            ViewBag.NguoiBenh = data.Data.NguoiBenh;
            ViewBag.DotKham = data.Data.DotKham;
            ViewBag.Dichvu = data.Data.DichVu;
            ViewBag.PhieuHoan = data.Data.PhieuHoan;
            ViewBag.PhieuThu = data.Data.PhieuThu;
            ViewBag.SoTienTamUng = data.Data.DotKham.SoTienTamUng;
            ViewBag.VienPhi = data.Data.DotKham.VienPhi;
            ViewBag.ConThieu = data.Code == 1 ? data.Data.DotKham.VienPhi - data.Data.DotKham.SoTienTamUng : 0;
            ViewBag.Message = data.Message;

            return View(data);
        }
        // Thu tạm ứng
        public async Task<IActionResult> ThuTamUng([FromBody] JsonElement payload)
        {
            try
            {
#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
                string token = payload.GetProperty("token").GetString();
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.
                int maDotKham = payload.GetProperty("ma_dot_kham").GetInt32();
                decimal soTien = payload.GetProperty("so_tien").GetDecimal();

                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}thu_tam_ung";

                var body = new
                {
                    p_token = token,
                    p_ma_dot_kham = maDotKham,
                    p_so_tien = soTien
                };

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Content = new StringContent(
                    JsonSerializer.Serialize(body),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.SendAsync(request);

                var result = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "❌ Thu tạm ứng thất bại", detail = result });
                }

                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "❌ Lỗi xử lý thu tạm ứng", detail = ex.Message });
            }
        }
        // Hoàn tạm ứng
        public async Task<IActionResult> HoanTamUng([FromBody] JsonElement payload)
        {
            try
            {
#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
                string token = payload.GetProperty("token").GetString();
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.
                int maPhieuThuTamUng = payload.GetProperty("ma_phieu_thu_tam_ung").GetInt32();

                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}hoan_tam_ung";

                var body = new
                {
                    p_token = token,
                    p_ma_phieu_tam_ung = maPhieuThuTamUng
                };

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Content = new StringContent(
                    JsonSerializer.Serialize(body),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.SendAsync(request);

                var result = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "❌ Hoàn tạm ứng thất bại", detail = result });
                }

                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "❌ Lỗi xử lý hoàn tạm ứng", detail = ex.Message });
            }
        }

        //Tất toán
        public async Task<IActionResult> TatToan([FromBody] JsonElement payload)
        {
            try
            {
#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
                string token = payload.GetProperty("token").GetString();
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.
                int maHoso = payload.GetProperty("ma_ho_so").GetInt32();
                decimal soTienTatToan = payload.GetProperty("so_tien_tat_toan").GetDecimal();

                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}tat_toan_ho_so";

                var body = new
                {
                    p_token = token,
                    p_ma_dot_kham = maHoso,
                    p_so_tien_tat_toan = soTienTatToan
                };

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Content = new StringContent(
                    JsonSerializer.Serialize(body),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.SendAsync(request);

                var result = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "❌ Hoàn tạm ứng thất bại", detail = result });
                }

                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "❌ Lỗi xử lý hoàn tạm ứng", detail = ex.Message });
            }
        }

        //FUNCTION IN ---------------------------------------------------------------------------------------------------------
        public async Task<IActionResult> InPhieuTamUng([FromBody] object payload)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseFunctionURL"];
                string apiUrl = $"{baseUrl}phieu-tam-ung";

                var jsonPayload = payload.ToString();

                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl)
                {
                    Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
                };

                request.Headers.Accept.Clear();
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/pdf"));

                var response = await _httpClient.SendAsync(request);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Gọi Supabase thất bại",
                        status = (int)response.StatusCode,
                        detail = responseContent
                    });
                }

                return Content(responseContent, "text/html");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller", detail = ex.Message });
            }
        }
        // In hóa đơn thu in nhiệt
        public async Task<IActionResult> InPhieuThu([FromBody] object payload)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseFunctionURL"];
                string apiUrl = $"{baseUrl}phieu-thu";

                var jsonPayload = payload.ToString();

                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl)
                {
                    Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
                };

                request.Headers.Accept.Clear();
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/pdf"));

                var response = await _httpClient.SendAsync(request);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Gọi Supabase thất bại",
                        status = (int)response.StatusCode,
                        detail = responseContent
                    });
                }

                return Content(responseContent, "text/html");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller", detail = ex.Message });
            }
        }
        public async Task<IActionResult> InBangKe([FromBody] object payload)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseFunctionURL"];
                string apiUrl = $"{baseUrl}chi-phi-kham";

                var jsonPayload = payload.ToString();

                var request = new HttpRequestMessage(HttpMethod.Post, apiUrl)
                {
                    Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
                };

                request.Headers.Accept.Clear();
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/pdf"));

                var response = await _httpClient.SendAsync(request);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "Gọi Supabase thất bại",
                        status = (int)response.StatusCode,
                        detail = responseContent
                    });
                }

                return Content(responseContent, "text/html");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller", detail = ex.Message });
            }
        }
    }
}
