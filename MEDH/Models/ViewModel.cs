using System.Text.Json.Serialization;

namespace MEDH.Models
{
    public class ChitietTiepdonViewModel
    {
        public int MaHoSo { get; set; }
        public string HoTen { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string GioiTinh { get; set; }
        public string DiaChi { get; set; }
        public string? SoTheBHYT { get; set; }
        public decimal? MucHuongBHYT { get; set; }
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

    //CHI TIẾT TẠM ỨNG VIEW MODEL
    public class ChiTietTamUngViewModel
    {
        [JsonPropertyName("r_status")]
        public string Status { get; set; }

        [JsonPropertyName("r_message")]
        public string Message { get; set; }

        [JsonPropertyName("code")]
        public int Code { get; set; }

        [JsonPropertyName("data")]
        public TamUngData Data { get; set; }
    }

    public class TamUngData
    {
        [JsonPropertyName("dot_kham")]
        public DotKhamInfo DotKham { get; set; }

        [JsonPropertyName("nguoi_benh")]
        public NguoiBenhInfo NguoiBenh { get; set; }

        [JsonPropertyName("dich_vu")]
        public List<DichVuInfo> DichVu { get; set; }

        [JsonPropertyName("phieu_thu_tam_ung")]
        public List<ThuTamUngInfo> PhieuThu { get; set; }
        [JsonPropertyName("phieu_hoan_tam_ung")]
        public List<HoanTamUngInfo> PhieuHoan { get; set; }
    }

    public class DotKhamInfo
    {
        [JsonPropertyName("ma_dot_kham")]
        public int MaDotKham { get; set; }

        [JsonPropertyName("ngay_tiep_don")]
        public DateTime NgayTiepDon { get; set; }

        [JsonPropertyName("trang_thai")]
        public bool TrangThai { get; set; }

        [JsonPropertyName("trang_thai_kham")]
        public bool TrangThaiKham { get; set; }

        [JsonPropertyName("so_tien_tam_ung")]
        public decimal SoTienTamUng { get; set; }

        [JsonPropertyName("vien_phi")]
        public decimal VienPhi { get; set; }
        [JsonPropertyName("so_the_bhyt")]
        public string? SoTheBHYT { get; set; }
        [JsonPropertyName("muc_huong_bhyt")]
        public decimal? MucHuongBHYT { get; set; }
    }

    public class NguoiBenhInfo
    {
        [JsonPropertyName("ma_nguoi_benh")]
        public int MaNguoiBenh { get; set; }

        [JsonPropertyName("ho_ten")]
        public string HoTen { get; set; }

        [JsonPropertyName("gioi_tinh")]
        public string GioiTinh { get; set; }

        [JsonPropertyName("ngay_sinh")]
        public DateTime NgaySinh { get; set; }

        [JsonPropertyName("so_dien_thoai")]
        public string SoDienThoai { get; set; }

        [JsonPropertyName("dia_chi")]
        public string DiaChi { get; set; }
    }

    public class DichVuInfo
    {
        [JsonPropertyName("ten")]
        public string Ten { get; set; }

        [JsonPropertyName("loai")]
        public string Loai { get; set; }

        [JsonPropertyName("gia_tien")]
        public decimal GiaTien { get; set; }

        [JsonPropertyName("thanh_toan")]
        public string ThanhToan { get; set; }

        [JsonPropertyName("trang_thai")]
        public string TrangThai { get; set; }

        [JsonPropertyName("ngay_thuc_hien")]
        public DateTime NgayThucHien { get; set; }

        [JsonPropertyName("nguon")]
        public string Nguon { get; set; }

        [JsonPropertyName("so_luong")]
        public int? SoLuong { get; set; }
    }

    public class HoanTamUngInfo
    {
        [JsonPropertyName("ma_phieu")]
        public int MaPhieu { get; set; }
        [JsonPropertyName("ma_phieu_thu")]
        public int MaPhieuThu { get; set; }

        [JsonPropertyName("so_tien")]
        public decimal SoTien { get; set; }

        [JsonPropertyName("ngay_hoan")]
        public DateTime NgayHoan { get; set; }

        [JsonPropertyName("nguoi_hoan")]
        public int MaNguoiHoan { get; set; }

        [JsonPropertyName("ten_nguoi_hoan")]
        public string TenNguoiHoan { get; set; }
    }

    public class ThuTamUngInfo
    {
        [JsonPropertyName("ma_phieu")]
        public int MaPhieu { get; set; }

        [JsonPropertyName("so_tien")]
        public decimal SoTien { get; set; }

        [JsonPropertyName("ngay_thu")]
        public DateTime NgayThu { get; set; }

        [JsonPropertyName("nguoi_thu")]
        public int MaNguoiThu { get; set; }

        [JsonPropertyName("ten_nguoi_thu")]
        public string TenNguoiThu { get; set; }
        [JsonPropertyName("trang_thai_phieu_thu")]
        public string TrangThaiPhieuThu { get; set; }

    }

    //Danh sách tạm ứng
    public class DanhSachTamUngViewModel
    {
        [JsonPropertyName("ma_dot_kham")]
        public int MaDotKham { get; set; }

        [JsonPropertyName("ma_nguoi_benh")]
        public int MaNguoiBenh { get; set; }

        [JsonPropertyName("ten_nguoi_benh")]
        public string TenNguoiBenh { get; set; }

        [JsonPropertyName("ngay_sinh")]
        public DateTime NgaySinh { get; set; }
        [JsonPropertyName("gioi_tinh")]
        public string GioiTinh { get; set; }
        [JsonPropertyName("so_tien_con_lai")]
        public decimal SoTienTamUng { get; set; }
        [JsonPropertyName("ten_nhan_vien_tiep_don")]
        public string TenNhanVienTiepDon { get; set; }
        [JsonPropertyName("ngay_tiep_don")]
        public DateTime NgayTiepDon { get; set; }
    }
    //Danh sách phiếu thu tất toán
    public class DanhSachPhieuThuTatToan
    {
        [JsonPropertyName("ma_dot_kham")]
        public int MaDotKham { get; set; }

        [JsonPropertyName("ma_nguoi_benh")]
        public int MaNguoiBenh { get; set; }

        [JsonPropertyName("ten_nguoi_benh")]
        public string TenNguoiBenh { get; set; }

        [JsonPropertyName("ngay_sinh")]
        public DateTime NgaySinh { get; set; }

        [JsonPropertyName("gioi_tinh")]
        public string GioiTinh { get; set; }

        [JsonPropertyName("dia_chi")]
        public string DiaChi { get; set; }

        [JsonPropertyName("ngay_tiep_don")]
        public DateTime NgayTiepDon { get; set; }

        [JsonPropertyName("trang_thai")]
        public bool TrangThai { get; set; }

        [JsonPropertyName("so_tien_tam_ung")]
        public decimal SoTienTamUng { get; set; }

        [JsonPropertyName("tong_vien_phi")]
        public decimal TongVienPhi { get; set; }

        [JsonPropertyName("so_tien_con_lai")]
        public decimal SoTienConLai { get; set; }
    }
    // Chi tiết phiếu tất toán
    public class ChiTietTatToanViewModel
    {
        [JsonPropertyName("r_status")]
        public string Satus { get; set; }

        [JsonPropertyName("data")]
        public ChiTietTatToanDataViewModel Data { get; set; }
    }
    public class ChiTietTatToanDataViewModel
    {
        [JsonPropertyName("thong_tin_chung")]
        public ThongTinChungViewModel ThongTinChung { get; set; }

        [JsonPropertyName("phieu_tat_toan")]
        public PhieuTatToanViewModel? PhieuTatToan { get; set; }

        [JsonPropertyName("dich_vu")]
        public List<DichVuInfo> DichVu { get; set; }
    }
    public class PhieuTatToanViewModel
    {
        [JsonPropertyName("ma_phieu_tat_toan")]
        public int MaPhieuTatToan { get; set; }

        [JsonPropertyName("ma_dot_kham")]
        public int MaDotKham { get; set; }

        [JsonPropertyName("ma_nguoi_benh")]
        public int MaNguoiBenh { get; set; }

        [JsonPropertyName("ho_ten")]
        public string HoTen { get; set; }

        [JsonPropertyName("gioi_tinh")]
        public string GioiTinh { get; set; }

        [JsonPropertyName("ngay_sinh")]
        public DateTime NgaySinh { get; set; }

        [JsonPropertyName("so_dien_thoai")]
        public string SoDienThoai { get; set; }

        [JsonPropertyName("dia_chi")]
        public string DiaChi { get; set; }

        [JsonPropertyName("so_tien_tat_toan")]
        public decimal SoTienTatToan { get; set; }

        [JsonPropertyName("nguoi_thu")]
        public int? NguoiThu { get; set; }

        [JsonPropertyName("ngay_tat_toan")]
        public DateTime NgayTatToan { get; set; }
    }

    // thông tin chung
    public class ThongTinChungViewModel
    {
        [JsonPropertyName("ma_dot_kham")]
        public int MaDotKham { get; set; }

        [JsonPropertyName("ngay_tiep_don")]
        public DateTime NgayTiepDon { get; set; }

        [JsonPropertyName("trang_thai")]
        public bool TrangThai { get; set; }

        [JsonPropertyName("trang_thai_kham")]
        public bool TrangThaiKham { get; set; }

        [JsonPropertyName("so_tien_tam_ung")]
        public decimal SoTienTamUng { get; set; }

        [JsonPropertyName("so_the_bhyt")]
        public string? SoTheBHYT { get; set; }

        [JsonPropertyName("muc_huong_bhyt")]
        public decimal? MucHuongBHYT { get; set; }

        [JsonPropertyName("vien_phi")]
        public decimal VienPhi { get; set; }

        [JsonPropertyName("ma_nguoi_benh")]
        public int MaNguoiBenh { get; set; }

        [JsonPropertyName("ho_ten")]
        public string HoTen { get; set; }

        [JsonPropertyName("gioi_tinh")]
        public string GioiTinh { get; set; }

        [JsonPropertyName("ngay_sinh")]
        public DateTime NgaySinh { get; set; }

        [JsonPropertyName("so_dien_thoai")]
        public string? SoDienThoai { get; set; }

        [JsonPropertyName("dia_chi")]
        public string DiaChi { get; set; }
    }

}
