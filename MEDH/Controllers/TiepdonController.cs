using Microsoft.AspNetCore.Mvc;

namespace MEDH.Controllers
{
    public class TiepdonController : Controller
    {
        public IActionResult Tiepdonmoi()
        {
            return View();
        }

        public IActionResult Dstiepdon()
        {
            return View();
        }

        public IActionResult Kedichvutiepdon(String maHS)
        {
            ViewBag.MaHS = maHS;
            return View();
        }

        public IActionResult Chitietnbtiepdon(String maHS)
        {
            ViewBag.MaHS = maHS;
            return View();
        }

        public IActionResult Dshenkham()
        {
            return View();
        }
    }

}
