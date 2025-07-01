using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;

namespace MEDH.Controllers
{
    public class TiepdonController : Controller
    {
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


        public IActionResult Chitietnbtiepdon(String maHS)
        {
            ViewBag.MaHS = maHS;
            return View();
        }

        public IActionResult Dshenkham()
        {
            return View();
        }
    }

}
