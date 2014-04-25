using EndGate.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GalaxyTradeWars
{
    using EndGate.Server.MovementControllers;

    public class Vector2dTweener : MovementController
    {
        public Vector2d From { get; private set; }
        public Vector2d To { get; private set; }
        private bool _isPlaying;
        public Vector2d Current { get; private set; }
        public TimeSpan Elapsed { get; private set; }
        public TimeSpan Duration { get; private set; }
        public double Speed { get; private set; }
        public event EventHandler<Vector2d> OnChange;
        public event EventHandler<Vector2dTweener> OnComplete;

        public Vector2dTweener(Vector2d current, double speed, Player player) : base(new [] { player })
        {
            Speed = speed;
            Current = current;
        }
        
        public void MoveTo(Vector2d from, Vector2d to)
        {
            
            double distance = from.Distance(to).Length();
            TimeSpan duration = new TimeSpan(0,0,(int)(distance / Speed));            
            this.From = from;
            this.To = to;
            this.Duration = duration;
            this.Elapsed = TimeSpan.Zero;

            if (!_isPlaying)
            {
                this.Play();
            }
            else
            {
                this.Restart();
            }
        }

        private void Changed(Vector2d vector)
        {
            if (this.OnChange != null)
            {
                this.OnChange(this, vector);
            }
        }

        private void Completed(Vector2dTweener vector)
        {
            if (this.OnComplete != null)
            {
                this.OnComplete(this, vector);
            }
        }

        public void Update(GameTime gameTime)
        {
            if (!this._isPlaying)
            {
                return;
            }

            this.Elapsed = this.Elapsed.Add(gameTime.Elapsed);

            if (this.Elapsed.TotalMilliseconds >= this.Duration.TotalMilliseconds)
            {
                this.Elapsed = this.Duration;
                this.Current = this.To.Clone();
                this._isPlaying = false;

                this.Changed(this.Current.Clone());
                this.Completed(this);
            }
            else
            {
                this.UpdateTween();
                this.Changed(this.Current.Clone());
            }

            foreach (var moveable in this.Moveables)
            {
                moveable.Position = this.Current.Clone();
                moveable.Rotation = Rotation;
            }
        }

        public void UpdateTween()
        {
            this.Current = new Vector2d(
                this.TweeningFunction(this.From.X, this.To.X, this.Elapsed, this.Duration),
                this.TweeningFunction(this.From.Y, this.To.Y, this.Elapsed, this.Duration)
            );
        }

        private double TweeningFunction(double from, double to, TimeSpan elapsed, TimeSpan duration)
        {
            var change = to - from;

            return change * elapsed.TotalMilliseconds / duration.TotalMilliseconds + from;
        }

        public void Play()
        {
            this._isPlaying = true;
        }

        public void Pause()
        {
            this._isPlaying = false;
        }

        public void Stop()
        {
            this._isPlaying = false;
            this.Reset();
        }

        public void Restart()
        {
            this.Reset();
            this.Play();
        }

        public void Reset()
        {
            this.Elapsed = TimeSpan.Zero;
            this.Current = this.From.Clone();
        }
    }
}