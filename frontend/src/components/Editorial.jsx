import { useState, useRef, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';



const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {


  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, []);

  return (
    <div 
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="aspect-video w-full cursor-pointer bg-black"
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-4 transition-opacity ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="mr-3 inline-grid h-11 w-11 place-items-center rounded-full bg-cyan-300 text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause/>
          ) : (
            <Play/>
          )}
        </button>
        
        {/* Progress Bar */}
        <div className="flex items-center w-full mt-2">
          <span className="text-white text-sm mr-2">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = Number(e.target.value);
              }
            }}
            className="h-1 flex-1 accent-cyan-300"
          />
          <span className="text-white text-sm ml-2">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};


export default Editorial;
