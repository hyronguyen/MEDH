using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using System.Net.Http;
using MEDH.Models;

namespace MEDH.Controllers
{
    public class TiepdonController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public TiepdonController(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }
        public IActionResult Tiepdonmoi()
        {
            return View();
        }

        public IActionResult Dstiepdon()
        {
            return View();
        }

        public async Task<IActionResult> Kedichvutiepdon(string maHS)
        {
            var apiUrl = "https://mpmtmnfjswssnkjbrhfw.supabase.co/rest/v1/rpc/lay_ho_so_chi_tiet";
            var apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXRtbmZqc3dzc25ramJyaGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzU3OTEsImV4cCI6MjA2NTQ1MTc5MX0.DpcrSo6Iu9DbEHImq7WSKMXYnne9GHszSWazgia1LJM";

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("apikey", apiKey);

            var payload = new { ma_dot_kham_input = int.Parse(maHS) };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await client.PostAsync(apiUrl, content);
            if (!response.IsSuccessStatusCode) return BadRequest("Không lấy được thông tin hồ sơ.");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var data = doc.RootElement.GetProperty("data");

            // Gán từng phần vào ViewBag
            ViewBag.MaHS = data.GetProperty("dot_kham").GetProperty("ma_dot_kham").GetInt32();
            ViewBag.MaNB = data.GetProperty("nguoi_benh").GetProperty("ma_nguoi_benh").GetInt32();
            ViewBag.HoTen = data.GetProperty("nguoi_benh").GetProperty("ho_ten").GetString();
            ViewBag.SDT = data.GetProperty("nguoi_benh").TryGetProperty("so_dien_thoai", out var sdt) ? sdt.GetString() : null;
            ViewBag.DiaChi = data.GetProperty("nguoi_benh").TryGetProperty("dia_chi", out var dc) ? dc.GetString() : null;
            ViewBag.BHYT = data.GetProperty("dot_kham").TryGetProperty("so_the_bhyt", out var bh) ? bh.GetString() : null;
            ViewBag.LyDoKham = data.GetProperty("dot_kham").TryGetProperty("ly_do_den_kham", out var ld) ? ld.GetString() : null;
            if (data.GetProperty("dot_kham").TryGetProperty("muc_huong_bhyt", out var mh))
            {
                ViewBag.MucHuong = mh.ValueKind switch
                {
                    JsonValueKind.String => mh.GetString(),
                    JsonValueKind.Number => mh.GetRawText(), 
                    _ => null
                };
            }
            else
            {
                ViewBag.MucHuong = null;
            }


            return View();
        }


        public async Task<IActionResult> Chitietnbtiepdon(string maHS)
        {
            try
            {
                var maDotKham = int.Parse(maHS);
                var viewModel = new ChitietTiepdonViewModel();
                viewModel.MaHoSo = maDotKham;

                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                var requestUrl = baseUrl + "lay_ho_so_chi_tiet";

                var payload = new { ma_dot_kham_input = maDotKham };

                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
                };
                request.Headers.Add("apikey", apiKey);

                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest("Lỗi truy vấn Supabase");
                }

                var jsonStr = await response.Content.ReadAsStringAsync();
                var json = JsonDocument.Parse(jsonStr).RootElement;

                var data = json.GetProperty("data");

                var nb = data.GetProperty("nguoi_benh");
                viewModel.HoTen = nb.GetProperty("ho_ten").GetString();
                viewModel.GioiTinh = nb.GetProperty("gioi_tinh").GetString();
                viewModel.NgaySinh = nb.GetProperty("ngay_sinh").GetDateTime();
                viewModel.DiaChi = nb.GetProperty("dia_chi").GetString();
                viewModel.GioiTinh = nb.GetProperty("gioi_tinh").GetString();

                var dichVus = data.GetProperty("dich_vu_kham").EnumerateArray();
                foreach (var dv in dichVus)
                {
                    viewModel.DichVus.Add(new DichVuDaKeViewModel
                    {
                        MaDichVu = dv.GetProperty("ma_dich_vu").GetInt32(),
                        MaDichVuKham = dv.GetProperty("ma_dich_vu_kham").GetInt32(),
                        TenDichVu = dv.GetProperty("ten_dich_vu").GetString(),
                        ThanhTien = dv.GetProperty("gia_tien").GetDecimal(),
                        ThanhToan = dv.GetProperty("thanh_toan").GetString(),
                        TrangThai = dv.GetProperty("trang_thai").GetString(),
                        NgayThucHien = dv.GetProperty("ngay_thuc_hien").GetDateTime()
                    });
                }

                return View(viewModel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý", detail = ex.Message });
            }
        }


        public IActionResult Dshenkham()
        {
            return View();
        }

        public async Task<IActionResult> Laydanhsachbndatiepdon()
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "lay_danh_sach_tiep_don";

                // Tạo Request
                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");

                // Gửi Request
                var response = await _httpClient.SendAsync(request);

                // Xử lý Response
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { message = "❌ Lỗi từ Supabase", detail = error });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller", detail = ex.Message });
            }
        }

    }

}
