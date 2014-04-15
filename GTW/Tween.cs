using EndGate.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GalaxyTradeWars
{
    public class Vector2dTweener : IUpdateable
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

        public Vector2dTweener(Vector2d current, double speed)
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

            if (this.Elapsed.Milliseconds >= this.Duration.Milliseconds)
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

            return change * elapsed.Milliseconds / duration.Milliseconds + from;
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