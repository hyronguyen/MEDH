using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
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
        // LƯU THÔNG TIN KHÁM
        public async Task<IActionResult> Luuthongtinkhambenh(string token,string MaHoSo,string sinhhieu, string hoibenh, string khamxet, string chuandoan,string dichvukham)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "cap_nhat_ho_so_dot_kham";

                //Tạo payload body
                var payload = new
                {
                    p_token = token,
                    ma_dot_kham_input = int.Parse(MaHoSo),
                    hoi_benh_input = hoibenh,
                    kham_xet_input = khamxet,
                    sinh_hieu_input = sinhhieu,
                    chuan_doan_input = chuandoan,
                    ma_dich_vu_kham_input= int.Parse(dichvukham)
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

                Console.WriteLine(payload.ToString()); 

                //Nhận Response
                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { message = "Lỗi từ Supabase", detail = errorText });
                }

                var result = await response.Content.ReadAsStringAsync();
                Console.WriteLine(result.ToString());
                return Content(result, "application/json");
               
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller", detail = ex.Message });
            }
        }
        // GỌI NGƯỜI BỆNH VÀO PHÒNG KHÁM
        public async Task<IActionResult> Goinguoibenhtieptheovaophongkham(string token, string maphong)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "goi_so_thu_tu";

                //Tạo payload body
                var payload = new
                {
                    p_token = token,
                    ma_phong_input = int.Parse(maphong)
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
                Console.WriteLine(result);
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi xử lý controller - Goinguoibenhtieptheovaophongkham", detail = ex.Message });
            }
        }
        // Xóa dịch vụ khám
        public async Task<IActionResult> Xoadichvukham(string madichvukham)
        {
            try
            {

                if (!int.TryParse(madichvukham, out int maDichVuInt))
                {
                    return BadRequest(new { message = "Mã dịch vụ khám không hợp lệ." });
                }

                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}xoa_dich_vu_kham";

          
                var payload = new { p_ma_dich_vu_kham = maDichVuInt };

      
                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Content = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(payload),
                        Encoding.UTF8,
                        "application/json")

                };

                request.Headers.Add("apikey", apiKey);
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        message = "❌ Lỗi từ Supabase",
                        detail = responseContent
                    });
                }

                return Content(responseContent, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ Lỗi xử lý controller",
                    detail = ex.Message
                });
            }
        }
        // Đóng hồ sơ
        public async Task<IActionResult> Xulyhosokham(int MaHoSo, bool trangthai)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURLv1"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = $"{baseUrl}hosodotkham?ma_dot_kham=eq.{MaHoSo}";

                // Gửi PATCH với trạng thái theo FE truyền vào
                var payload = new { trang_thai_kham = trangthai };
                var content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json"
                );

                var request = new HttpRequestMessage(HttpMethod.Patch, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Content = content;

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return BadRequest(new
                    {
                        status = "error",
                        message = "❌ Lỗi cập nhật trạng thái hồ sơ",
                        detail = errorContent
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = trangthai ? "Đã đóng hồ sơ" : "Đã mở hồ sơ"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = "❌ Lỗi hệ thống khi xử lý yêu cầu",
                    detail = ex.Message
                });
            }
        }
        // Lấy dánh sách thuốc theo đối tượng truyền vào
        public async Task<IActionResult> LayDanhSachThuocTheoDoiTuong(string doiTuong)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURLv1"]; // Đường dẫn Supabase đến /rest/v1/
                string apiKey = _configuration["SUPBASECONFIG:apikey"];

                string queryString = doiTuong == "BH"
                    ? "thanh_toan=in.(BH,DV)"   
                    : "thanh_toan=eq.DV";

                string requestUrl = $"{baseUrl}thuoc?{queryString}";

                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");

                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { message = "❌ Lỗi từ Supabase", detail = errorText });
                }

                var content = await response.Content.ReadAsStringAsync();
                return Content(content, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "❌ Lỗi xử lý controller", detail = ex.Message });
            }
        }
        // Tạo đơn thuốc mới
        public async Task<IActionResult> TaoDonThuoc(string token, string maDotKham)
        {
            try
            {
                Console.WriteLine(maDotKham + " " + token);
                if (string.IsNullOrWhiteSpace(token) || maDotKham == null)
                {
                    return BadRequest(new { message = "❌ Thiếu token hoặc mã đợt khám không hợp lệ." });
                }

                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                string apiKey = _configuration["SUPBASECONFIG:apikey"];
                string requestUrl = baseUrl + "tao_don_thuoc";

                var payload = new
                {
                    p_token = token,
                    p_ma_dot_kham = int.Parse(maDotKham)
                };
                Console.WriteLine(requestUrl+ " "+payload);
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
                    return BadRequest(new { message = "❌ Lỗi từ Supabase", detail = errorText });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ Lỗi xử lý controller - TaoDonThuoc",
                    detail = ex.Message
                });
            }
        }
        // Kê thuốc vào đơn 
        public async Task<IActionResult> KeThuoc(string token,[FromBody] JsonElement payloads)
        {
            try
            {
                var baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];
                var apiKey = _configuration["SUPBASECONFIG:apikey"];
                var url = $"{baseUrl}ke_chi_tiet_don_thuoc";

                var successList = new List<object>();
                var errorList = new List<object>();

                if (payloads.ValueKind != JsonValueKind.Array)
                    return BadRequest(new { message = "Payload không đúng định dạng mảng." });

                foreach (var item in payloads.EnumerateArray())
                {
                    try
                    {
                        var rpcPayload = new
                        {
                            p_token = token,
                            p_ma_don_thuoc = item.GetProperty("p_ma_don_thuoc").GetInt32(),
                            p_ma_thuoc = item.GetProperty("p_ma_thuoc").GetInt32(),
                            p_so_luong = item.GetProperty("p_so_luong").GetInt32(),
                            p_lieu_dung = item.GetProperty("p_lieu_dung").GetString(),
                            p_thanh_tien = item.GetProperty("p_thanh_tien").GetDecimal()
                        };

                        var request = new HttpRequestMessage(HttpMethod.Post, url);
                        request.Headers.Add("apikey", apiKey);
                        request.Content = new StringContent(System.Text.Json.JsonSerializer.Serialize(rpcPayload), Encoding.UTF8, "application/json");

                        var response = await _httpClient.SendAsync(request);
                        var responseText = await response.Content.ReadAsStringAsync();

                        if (response.IsSuccessStatusCode)
                            successList.Add(new { rpcPayload.p_ma_thuoc, status = "OK", response = responseText });
                        else
                            errorList.Add(new { rpcPayload.p_ma_thuoc, status = "FAIL", error = responseText });
                    }
                    catch (Exception ex)
                    {
                        errorList.Add(new { status = "ERROR_PARSE", detail = ex.Message });
                    }
                }

                return Ok(new
                {
                    status = errorList.Count == 0 ? "success" : "partial",
                    successCount = successList.Count,
                    failCount = errorList.Count,
                    successList,
                    errorList
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "❌ Lỗi xử lý controller", detail = ex.Message });
            }
        }
        // Xóa đón thuốc
        public async Task<IActionResult> XoaDonThuoc([FromQuery] int maDonThuoc)
        {
            try
            {
                string baseUrl = _configuration["SUPBASECONFIG:SupbaseURL"];  
                string apiKey = _configuration["SUPBASECONFIG:apikey"];

                // Endpoint RPC function Supabase
                string requestUrl = $"{baseUrl}xoa_don_thuoc";

                // Chuẩn bị payload
                var payload = new { p_ma_don_thuoc = maDonThuoc };
                var content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json"
                );

                // Gửi request
                var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
                request.Headers.Add("apikey", apiKey);
                request.Headers.Add("Accept", "application/json");
                request.Content = content;

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return BadRequest(new
                    {
                        message = "❌ Lỗi khi gọi Supabase RPC",
                        detail = error
                    });
                }

                var result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ Lỗi xử lý controller - XoaDonThuoc",
                    detail = ex.Message
                });
            }
        }

    }
}
