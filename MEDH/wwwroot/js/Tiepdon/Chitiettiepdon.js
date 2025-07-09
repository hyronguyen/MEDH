async function XoaDichVu(MaDichVuKham) {
    try {
        const response = await fetch(`/Khambenh/Xoadichvukham?madichvukham=${MaDichVuKham}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Lỗi khi xóa dịch vụ:", error.detail || error.message);
            alert(`Không thể xóa dịch vụ: ${error.message}`);
            return;
        }

        alert(`✅ Đã xóa dịch vụ "${MaDichVuKham}" khỏi hồ sơ.`);
    } catch (err) {
        console.error("❌ Lỗi kết nối khi xóa dịch vụ:", err);
        alert("❌ Không thể kết nối tới máy chủ.");
    }
}