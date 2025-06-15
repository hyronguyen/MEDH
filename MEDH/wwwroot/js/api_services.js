const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXRtbmZqc3dzc25ramJyaGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzU3OTEsImV4cCI6MjA2NTQ1MTc5MX0.DpcrSo6Iu9DbEHImq7WSKMXYnne9GHszSWazgia1LJM';
const api_host = 'https://mpmtmnfjswssnkjbrhfw.supabase.co';


//Tiếp đón người bệnh
window.TiepDonNguoiBenh = async function (payload) {
    try {
        const response = await fetch(`${api_host}/rest/v1/rpc/tiep_don_nguoi_benh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Có lỗi xảy ra khi tiếp đón.');
        }

        const result = await response.json();
        console.log("Tiếp đón thành công:", result);
        alert(result.status);
    } catch (err) {
        console.error("Lỗi:", err.message);
        alert("Lỗi khi tiếp đón: " + err.message);
    }
};

window.LayDanhSachPhongTiepDon = async function () {
    try {
        const response = await fetch(`${api_host}/rest/v1/phong?loai_phong=eq.tiep_don`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey,
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Không thể lấy danh sách phòng tiếp đón.');
        }

        const danhSachPhong = await response.json();

        console.log("📋 Danh sách phòng tiếp đón:");
        danhSachPhong.forEach(phong => {
            console.log(`- Mã: ${phong.ma_phong}, Tên: ${phong.ten_phong}, Khoa: ${phong.khoa}`);
        });

        return danhSachPhong;

    } catch (err) {
        console.error("❌ Lỗi khi lấy phòng tiếp đón:", err.message);
        return [];
    }
};


window.GoiSoThuTu = async function (payload) {
    try {
        const response = await fetch(`${api_host}/rest/v1/rpc/goi_so_thu_tu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gọi số thứ tự thất bại.');
        }

        const result = await response.json();
        console.log("📢 Kết quả gọi số thứ tự:", result);
        return result;

    } catch (err) {
        console.error("❌ Lỗi khi gọi số thứ tự:", err.message);
        alert("Lỗi khi gọi số thứ tự: " + err.message);
        return null;
    }
};

window.LaySTTDaGoiMoiNhat = async function (maPhong) {
    try {
        const payload = {
            ma_phong_input: maPhong
        };

        const response = await fetch(`${api_host}/rest/v1/rpc/lay_stt_da_goi_moi_nhat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể lấy số thứ tự đã gọi.');
        }

        const result = await response.json();

        if (result.r_status !== 'success') {
            throw new Error(result.r_message || 'Không thành công.');
        }

        console.log("🔢 Số thứ tự đã gọi mới nhất:", result.r_so_thu_tu);
        return result.r_so_thu_tu;

    } catch (err) {
        console.error("❌ Lỗi khi lấy STT đã gọi:", err.message);
        return null;
    }
};
