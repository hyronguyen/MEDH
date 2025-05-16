const canvas = document.getElementById('pdf-viewer');
const ctx = canvas.getContext('2d');
const pdfUrl = "/assets/pdfs/nhap_vien_ver11.pdf";

// Ẩn canvas lúc đầu
canvas.style.display = "none";

document.getElementById('huong-dieu-tri').addEventListener('change', function () {
    const selectedValue = this.value;

    if (selectedValue === 'nhap-vien') {
        // Hiển thị canvas
        canvas.style.display = "block";

        // Tải PDF và hiển thị
        pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc => {
            return pdfDoc.getPage(1);
        }).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            page.render(renderContext);
        }).catch(err => {
            console.error('Lỗi load PDF:', err);
        });

    } else {
        // Ẩn canvas nếu không phải "nhập viện"
        canvas.style.display = "none";
    }
});
