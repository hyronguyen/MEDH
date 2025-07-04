﻿using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace MEDH.Controllers
{
    public class KhambenhController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public KhambenhController(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public async Task<IActionResult> Khambenhngoaitru(string MaHoso)
        {
            try
            {
                // Trường hợp đặc biệt: không có mã hồ sơ
                if (MaHoso == "N/A")
                {
                    ViewBag.MaHS = null;
                    ViewBag.JsonResponse = null;
                    return View();
                }

                // Đọc cấu hình Supabase
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "lay_ho_so_chi_tiet";

                // Tạo payload
                var payload = new { ma_dot_kham_input = int.Parse(MaHoso) };

                // Tạo request
                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Content = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(payload),
                        Encoding.UTF8,
                        "application/json")
                };
                request.Headers.Add("apikey", apiKey);

                // Gửi request
                var response = await _httpClient.SendAsync(request);
                var resultString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "Lỗi từ Supabase", detail = resultString });
                }

                // Phân tích JSON trả về
                var json = JsonDocument.Parse(resultString);

                if (json.RootElement.TryGetProperty("data", out var dataElement) &&
                    dataElement.TryGetProperty("dot_kham", out var dotKhamElement) &&
                    dotKhamElement.TryGetProperty("ma_dot_kham", out var maDotKhamElement))
                {
                    ViewBag.MaHS = maDotKhamElement.GetInt32();
                }
                else
                {
                    ViewBag.MaHS = null;
                }

                // Lưu toàn bộ JSON vào ViewBag để render xuống client
                ViewBag.JsonResponse = resultString;
                return View();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi xử lý controller",
                    detail = ex.Message
                });
            }
        }

        // LẤY DANH SÁCH NGƯỜI BỆNH TẠI PHÒNG KHÁM - LỌC THEO MÃ BÁC SĨ VÀ MÃ PHÒNG
        public async Task<IActionResult> Laydanhsachnguoibenhtaiphong(string mabacsi, string maPhong)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "tim_dich_vu_kham_theo_phong_va_bac_si";

                var payload = new
                {
                    p_ma_phong = int.Parse(maPhong),
                    p_ma_bac_si = int.Parse(mabacsi)
                };

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Content = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(payload),
                        Encoding.UTF8,
                        "application/json")
                };
                request.Headers.Add("apikey", apiKey);

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { message = "Lỗi từ Supabase", detail = errorText });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller", detail = ex.Message });
            }
        }


        // LẤY DANH SÁCH PHÒNG THUỘC BÁC SĨ
        public async Task<IActionResult> Laydanhsachphongthuocbacsi(string mabacsi)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "tim_phong_theo_nhan_vien";

                //Tạo payload body
                var payload = new
                {
                    p_ma_nhan_vien = int.Parse(mabacsi)
                };

                //Tạo Request
                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Content = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(payload),
                        Encoding.UTF8,
                        "application/json")
                };
                request.Headers.Add("apikey", apiKey);

                //Nhận Response
                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { message = "Lỗi từ Supabase", detail = errorText });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller", detail = ex.Message });
            }
        }
    }
}
