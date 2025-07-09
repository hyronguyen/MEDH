namespace MEDH.Models
{
    public class ChitietTiepdonViewModel
    {
        public int MaHoSo { get; set; }
        public string HoTen { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string GioiTinh { get; set; }
        public string DiaChi { get; set; }
        public List<DichVuDaKeViewModel> DichVus { get; set; } = new();
    }

    public class DichVuDaKeViewModel
    {
        public int MaDichVu { get; set; }
        public int MaDichVuKham { get; set; }
        public string TenDichVu { get; set; }
        public string TrangThai { get; set; }
        public decimal ThanhTien { get; set; }
        public string ThanhToan { get; set; }
        public DateTime? NgayThucHien { get; set; }
    }
}
