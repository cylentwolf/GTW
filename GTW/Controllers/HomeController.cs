using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GTW.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            if (!this.User.Identity.IsAuthenticated)
                ViewBag.Message = "Login to get started";
            else
            {
                ViewBag.Message = "Thanks for logging in.";
                // pass in an array and then use that to show objects
                
                return View();
            }
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your app description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}
