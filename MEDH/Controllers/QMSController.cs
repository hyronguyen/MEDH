using Microsoft.AspNetCore.Mvc;

namespace MEDH.Controllers
{
    public class QMSController : Controller
    {
        public IActionResult Qmsscreen()
        {
            return View();
        }
        public IActionResult Kiosk()
        {
            return View();
        }

    }
}
