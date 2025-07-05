using System.Text.Json.Serialization;

namespace MEDH.Models
{
    public class DichvuDTO
    {
        [JsonPropertyName("ma_dich_vu")]
        public int MaDichVu { get; set; }

        [JsonPropertyName("ten_dich_vu")]
        public string TenDichVu { get; set; }

        [JsonPropertyName("loai_dich_vu")]
        public string LoaiDichVu { get; set; }

        [JsonPropertyName("don_gia")]
        public decimal DonGia { get; set; }

        [JsonPropertyName("thanh_toan")]
        public string ThanhToan { get; set; }
        [JsonPropertyName("phong_thuc_hien")]
        public string PhongThucHien { get; set; }
    }
}
