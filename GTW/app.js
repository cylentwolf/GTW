/// <reference path="Scripts/endgate-0.2.0.d.ts" />
/// <reference path="Scripts/typings/signalr/signalr.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GTW = (function (_super) {
    __extends(GTW, _super);
    // If a canvas is not passed through to the Game's super constructor EndGate will generate a canvas that fills the entire page.
    function GTW(canvas, proxy) {
        var _this = this;
        _super.call(this, canvas);

        this._players = {};

        // Use JQuery to retrieve world.txt (a JSON file).
        // Only reason why it's not .json is because I'm lazy and didn't feel like adding the .json mime type.
        //$.getJSON("world.txt").done((json: string) => {
        //    // We now have the JSON from world.txt so we can use the EndGate JSONLoader to load it.
        //    // This loads maps that are created via http://www.mapeditor.org/ tiled program.
        //    // Maps are loaded asynchronously since they could take a long time, to learn more check out http://endgate.net/samples/maploading
        //    eg.MapLoaders.JSONLoader.Load(json, (result: eg.MapLoaders.IMapLoadedResult) => {
        //        // Maps can have multiple layers so we have to iterate through the layers and then add them to our scene one by one.
        //        for (var i = 0; i < result.Layers.length; i++) {
        //            // We're just subtracting 100 from each layers ZIndex to ensure that our laser cats are rendered on top of them.
        //            result.Layers[i].ZIndex -= 100;
        //            // Add the layer to the scene so it's rendered.
        //            this.Scene.Add(result.Layers[i]);
        //        }
        //    });
        //});
        this.Input.Mouse.OnClick.Bind(function (event) {
            //this._players[this._userId].MovementController.Position = event.Position;
            //this._targetPosition = event.Position;
            //proxy.server.move("Left", true);
            _this._players[_this._userId].MovementController.Position = event.Position;
        });

        // The From and To parameters (first two parameters) are being set to zero because we'll be setting them on mouse click.
        this._movementTween = new eg.Tweening.Vector2dTween(eg.Vector2d.Zero, eg.Vector2d.Zero, eg.TimeSpan.FromSeconds(1), eg.Tweening.Functions.Linear.EaseNone);

        // Every time the tween updates its value this event handler is triggered.
        this._movementTween.OnChange.Bind(function (newPosition) {
            _this._players[_this._userId].MovementController.Position = newPosition;
        });

        // This method is triggered roughly 25 times per second, the default value. (can be configured in the server)
        proxy.client.serverPush = function (serverPlayers) {
            var serverPlayer, clientPlayer;

            for (var i = 0; i < serverPlayers.length; i++) {
                serverPlayer = serverPlayers[i];

                // Try and look up our client player
                clientPlayer = _this._players[serverPlayer.ID];

                // Check if there is a client version of the server player.
                if (clientPlayer) {
                    clientPlayer.LoadPayload(serverPlayer);
                } else {
                    // Build a new player based off of the server player.
                    clientPlayer = new Player(serverPlayer);

                    // Monitor the created player so we don't create it again
                    _this._players[serverPlayer.ID] = clientPlayer;

                    // Add the player to the scene so it's rendered.
                    _this.Scene.Add(clientPlayer);
                }
            }
        };

        // Start the SignalR connection to the server.
        // This is asynchronous and returns a jQuery deferred.  You can learn more about jQuery deferred here: http://api.jquery.com/category/deferred-object/
        $.connection.hub.start().done(function () {
            // Invoke the server method "WhoAmI" (note that SignalR camel cases the method in the /signalr/hubs dynamically generated javascript file) so we can determine what our players user id is.
            proxy.server.whoAmI().done(function (userId) {
                // Save our user id so we can set the Scene's camera position to our players position.
                _this._userId = userId;

                // Build an input controller to do all of our heavy lifting of capturing keyboard input.
                // To learn more check out the input controller sample here: XXXXXXXXXXXXXXXX
                _this._controller = new eg.InputControllers.DirectionalInputController(_this.Input.Keyboard, // This function is executed every time the "User" attempts to perform a move. Aka every time they press the following keys:
                // "w", "a", "s", "d", "Left", "Up", "Right", "Down".
                // The direction is the direction in which the user attempted to move and the startMoving is whether or not the user attempted to start or stop moving.
                function (direction, startMoving) {
                    // Invoke the "Move" function on the server and pass in the direction and the startMoving parameter.(note that SignalR camel cases the method in the /signalr/hubs dynamically generated javascript file) so we can determine what our players user id is.
                    proxy.server.move(direction, startMoving);
                });

                _this.Input.Mouse.OnClick.Bind(function (event) {
                    //event.Position = this.Scene.Camera.ToCameraRelative(event.Position);
                    //console.log(event.Position.X + ':' + event.Position.Y);
                    ////var gameServer = $.connection.gameServer;
                    ////gameServer.server.send(event.Position.X + ":" + event.Position.Y);
                    //// Update the tween's from and to values
                    //this._movementTween.From = this._players[this._userId].MovementController.Position;
                    //this._movementTween.To = event.Position;
                    //// This is resetting the tween and then playing it, we're calling restart instead of play so that we can re-use the tween over and over.
                    //this._movementTween.Restart();
                    ////event.position = this.Scene.Camera.ToCameraRelative(event.position)
                    //this._players[this._userId].MovementController.Position = event.Position;
                    ////this._targetPosition = event.Position;
                    proxy.server.tween(_this._players[_this._userId].Position, event.Position);
                    //var direction;
                    //if (this._players[this._userId].MovementController.Position.Y > event.Position.Y)
                    //    direction =
                    //proxy.server.move("Left", true);
                });
            });
        });
    }
    // The Update function is triggered roughly 60 times per second (can be configured).
    GTW.prototype.Update = function (gameTime) {
        for (var id in this._players) {
            this._players[id].Update(gameTime);
        }

        // Check "Do I have a client player that is 'me'?"
        if (this._players[this._userId]) {
            // Move the scene's camera to be looking directly at me.
            // Note: In EndGate all positions are "center" positioned so simply setting the camera's position to my position centers it directly on me.
            // To learn more check out the camera sample here: XXXXXXXXXXXXX
            this.Scene.Camera.Position = this._players[this._userId].MovementController.Position;
        }
    };
    return GTW;
})(eg.Game);

// A player (laser cat) that inherits from the EndGate Sprite2d class (essentially an image that can be rendered to the screen).
// To learn more about Sprite2d's check out the sample here: XXXXXXXXXXXXX
var Player = (function (_super) {
    __extends(Player, _super);
    // Our player takes in a server player and then updates its flags to match.
    function Player(serverPlayer) {
        // We initially set the Player to be at 0, 0 because we immediately set the position to the server player's position via the LoadPayload method.
        _super.call(this, 0, 0, Player.Graphic);

        // Initialize a MovementController with the player as one of the IMoveables that are taken in and set the initial move speed to 100 pixels per second.
        // The reason why the IMoveables is an array is because the MovementController can sync more than one objects position to match its own.
        // You can see a great example of where this is used in the XXXX sample here: XXXXXXXXXXXXXXXXX
        this.MovementController = new eg.MovementControllers.LinearMovementController(new Array(this), 100);

        // Ensure that our position and our movement controller are up-to-date with the server version of the player.
        this.LoadPayload(serverPlayer);
    }
    // Used to synchronize client and server positions
    Player.prototype.LoadPayload = function (serverPlayer) {
        this.MovementController.Position = new eg.Vector2d(serverPlayer.MovementController.Position.X, serverPlayer.MovementController.Position.Y);
        this._movementTween.To = new eg.Vector2d(serverPlayer.MovementController.Position.X, serverPlayer.MovementController.Position.Y);

        for (var direction in serverPlayer.MovementController.Moving) {
            this.MovementController.Move(direction, serverPlayer.MovementController.Moving[direction]);
        }
    };

    // Called from the MMO's Update method
    Player.prototype.Update = function (gameTime) {
        // We update the MovementController so that it can move our player in the desired direction.
        this.MovementController.Update(gameTime);
        this._movementTween.Update(gameTime);
    };
    Player.Graphic = new eg.Graphics.ImageSource("Images/player.png", 75, 75);
    return Player;
})(eg.Graphics.Sprite2d);

// The .connection in $.connection is added by SignalR and the .gameHub is added by the /signalr/hubs file.
// Since the / signalr / hubs file is dynamically generated we have to tell TypeScript that we know that the
// .gameHub property is there so we cast the $.connection to "any".  "any" is essentially any raw javascript object.
var hubProxy = $.connection.gameHub, game = new GTW(document.getElementById("game"), hubProxy);
