using System.Text.Json.Serialization;

namespace MEDH.Models
{
    public class ThuocDTO
    {
        [JsonPropertyName("ma_thuoc")]
        public int MaThuoc { get; set; }

        [JsonPropertyName("ten_thuoc")]
        public string TenThuoc { get; set; }

        [JsonPropertyName("don_vi")]
        public string DonVi { get; set; }

        [JsonPropertyName("don_gia")]
        public decimal DonGia { get; set; }

        [JsonPropertyName("thanh_toan")]
        public string ThanhToan { get; set; }
    }
}
