using System.Text.Json.Serialization;

namespace MEDH.Models
{
    public class NhanvienDTO
    {
        [JsonPropertyName("ma_nhan_vien")]
        public int MaNhanVien { get; set; }

        [JsonPropertyName("ho_ten")]
        public string HoTen { get; set; }

        [JsonPropertyName("vai_tro")]
        public string VaiTro { get; set; }

        [JsonPropertyName("tai_khoan")]
        public string TaiKhoan { get; set; }

        [JsonPropertyName("mat_khau")]
        public string MatKhau { get; set; }
    }
}
