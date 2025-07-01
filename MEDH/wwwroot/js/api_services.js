window.apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXRtbmZqc3dzc25ramJyaGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzU3OTEsImV4cCI6MjA2NTQ1MTc5MX0.DpcrSo6Iu9DbEHImq7WSKMXYnne9GHszSWazgia1LJM';
window.api_host = 'https://mpmtmnfjswssnkjbrhfw.supabase.co';

// MODULE TIẾP ĐÓN ---------------------------------------------------------------------------------
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

        const result = await response.json();

        if (!response.ok) {
            console.error("Lỗi tiếp đón:", result?.message || 'Lỗi không xác định.');
            return { status: false };
        }

        // Xử lý trường hợp hồ sơ chưa hoàn thành
        if (result.status === "DA_TON_TAI_HSDT_CHUA_HOAN_THANH") {
            alert(`Người bệnh đã có hồ sơ chưa hoàn thành. Mã hồ sơ: ${result.ma_dot_kham}`);
            return {
                status: false,
                ma_dot_kham: result.ma_dot_kham || null,
                da_ton_tai: true
            };
        }

        console.log("Tiếp đón thành công:", result);
        return {
            status: true,
            ma_dot_kham: result?.ma_dot_kham || null
        };

    } catch (err) {
        console.error("Lỗi:", err.message);
        return { status: false };
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

window.apiKeDichVu = async function (payloads) {
    let allSuccess = true;

    for (const payload of payloads) {
        try {
            const response = await fetch(`${api_host}/rest/v1/rpc/ke_dich_vu_kham`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apikey
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.r_status === "SUCCESS") {
                console.log(`✅ Kê thành công dịch vụ mã ${payload.p_ma_dich_vu}`);
                apiSinhSTTchoDV(payload.p_ma_phong, payload.p_ma_dot_kham);
            } else {
                console.warn(`❌ Kê thất bại dịch vụ mã ${payload.p_ma_dich_vu}: ${result.r_message || 'Không rõ lỗi'}`);
                allSuccess = false;
            }
        } catch (err) {
            console.error(`❌ Lỗi hệ thống khi kê dịch vụ mã ${payload.p_ma_dich_vu}:`, err.message);
            allSuccess = false;
        }
    }

    console.log("👉 Đã hoàn tất quá trình kê tất cả dịch vụ.");
    return allSuccess;
};


// API CHUNG --------------------------------------------------------------------------------------

window.LayDanhSachDichVu = async function () {
    try {
        const response = await fetch(`${api_host}/rest/v1/rpc/lay_tat_ca_dich_vu`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey,
            }
        });

        const result = await response.json();
        console.log("Lấy danh sách thành công:", result);
        return result;
    }
    catch (err) {
        console.error("❌ Lỗi danh sách phòng:", err.message);
        alert("Lỗi: " + err.message);
    }
}

window.LayDanhSachPhong = async function () {
    try {
        const response = await fetch(`${api_host}/rest/v1/phong`, {
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

window.apiSinhSTTchoDV = async function (ma_phong, ma_ho_so) {
    const payload = {
        ma_phong_input: ma_phong,
        ma_ho_so_input: ma_ho_so
    };

    try {
        const response = await fetch(`${api_host}/rest/v1/rpc/lay_so_thu_tu_dv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json;
        if (result.r_status == "SUCCESS") {
            console.log(result.r_message);
        }
        else console.log(result.r_message);
    }
    catch (err) {
        console.log(err.message)
    }
}

// MODULE KHÁM BỆNH ---------------------------------------------------------------------------------

window.apiLayDanhSachNguoiBenhTaiPhong = async function (ma_bac_si_input, ma_phong_input) {
    try {
        const payload = {
            p_ma_phong: ma_phong_input,
            p_ma_bac_si: ma_bac_si_input
        };

        const response = await fetch(`${api_host}/rest/v1/rpc/tim_dich_vu_kham_theo_phong_va_bac_si`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey
            }, // ✅ Dấu phẩy thiếu ở đây đã được thêm vào
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Không thể lấy danh sách người bệnh tại phòng.');
        }

        const danhSachPhong = await response.json();
        console.log("Danh sách người bệnh tại phòng:", danhSachPhong);
        return danhSachPhong;
    }
    catch (err) {
        console.error("Lỗi khi gọi API:", err.message);
        return null;
    }
};
