EndGate.Server.SignalR
-------------------
EndGate.Server.SignalR is a sever API used to build game servers. SignalR is used
to communicate between the server and Client and the EndGate.Server API is used to 
supplement SignalR to make writing a game server easy.

To learn EndGate visit: http://endgate.net
To learn SignalR visit: http://www.asp.net/signalr


Enabling the server: Mapping the Hubs connection
------------------------------------------------
To enable SignalR in your application, create a class called Startup with the following:

using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(MyApplication.Startup))]

namespace MyApplication
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}