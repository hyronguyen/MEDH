using Microsoft.AspNetCore.Mvc;

namespace MEDH.Controllers
{
    public class ThunganController : Controller
    {
        public IActionResult Dsphieuthu()
        {
            return View();
        }

        public IActionResult Quanlytamung()
        {
            return View();
        }

        public IActionResult Dshoandoi()
        {
            return View();
        }

        public IActionResult Chitietphieuthu(String maHS)
        {
            ViewBag.MaHS = maHS;
            return View();
        }

        public IActionResult Chitiettamung(String maHS)
        {
            ViewBag.MaHS = maHS;
            return View();
        }
    }
}
