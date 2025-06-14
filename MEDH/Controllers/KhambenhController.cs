using Microsoft.AspNetCore.Mvc;

namespace MEDH.Controllers
{
    public class KhambenhController : Controller
    {
        public IActionResult Khambenhngoaitru(String MaHoso)
        {
            ViewBag.MaHS = MaHoso;
            return View();
        }
    }
}
