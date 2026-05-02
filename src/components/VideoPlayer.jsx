import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Settings, FastForward } from 'lucide-react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, videoId, onProgress }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const speedOptions = [0.5, 1, 1.25, 1.5, 2, 2.5, 3];

  // Resume from last position
  useEffect(() => {
    const savedTime = localStorage.getItem(`video-resume-${videoId}`);
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedTime);
      setCurrentTime(parseFloat(savedTime));
    }
  }, [videoId]);

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        localStorage.setItem(`video-resume-${videoId}`, videoRef.current.currentTime.toString());
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [videoId, isPlaying]);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / dur) * 100);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    videoRef.current.muted = newMute;
  };

  const changeSpeed = (speed) => {
    setPlaybackRate(speed);
    videoRef.current.playbackRate = speed;
    setShowSpeedMenu(false);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="smart-player-container" ref={containerRef}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="main-video-element"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current.duration)}
      />

      {/* Custom Overlay Controls */}
      <div className={`player-controls-overlay ${!isPlaying ? 'visible' : ''}`}>
        <div className="top-controls">
          <span className="video-badge">PREMIUM LECTURE</span>
        </div>

        <div className="center-controls" onClick={togglePlay}>
          {!isPlaying && <div className="big-play-btn"><Play size={48} fill="white" /></div>}
        </div>

        <div className="bottom-controls-bar">
          <div className="progress-row">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="seek-slider"
            />
          </div>

          <div className="actions-row">
            <div className="left-actions">
              <button onClick={togglePlay} className="ctrl-btn">
                {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
              </button>
              <button onClick={() => videoRef.current.currentTime -= 10} className="ctrl-btn">
                <RotateCcw size={20} />
              </button>
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="right-actions">
              <div className="volume-box">
                <button onClick={toggleMute} className="ctrl-btn">
                  {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>

              <div className="speed-selector-container">
                <button 
                  className="ctrl-btn speed-btn" 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                >
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="speed-dropdown">
                    {speedOptions.map(speed => (
                      <div 
                        key={speed} 
                        className={`speed-opt ${playbackRate === speed ? 'active' : ''}`}
                        onClick={() => changeSpeed(speed)}
                      >
                        {speed}x
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullScreen} className="ctrl-btn">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
