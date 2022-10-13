import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import WaveSurfer from "wavesurfer.js";
import { ReactComponent as Play } from "../../assets/play.svg";
import { ReactComponent as Pause } from "../../assets/pause.svg";
import { timeFormat } from "../../utils";
import throttle from "lodash/throttle";
const VoicePlayer = ({ incoming }) => {
  const waveformRef = useRef(null);
  const [play, setplay] = useState(false);
  const [urlPlay, seturlPlay] = useState(
    "https://api.twilio.com//2010-04-01/Accounts/AC25aa00521bfac6d667f13fec086072df/Recordings/RE6d44bc34911342ce03d6ad290b66580c.mp3"
  );

  const [currentTime, setCurrentTime] = useState();

  const handleProgress = (e) => {
    const time = timeFormat(Math.floor(e));

    setCurrentTime(time);
  };

  const throttleFn = useRef(throttle(handleProgress, 1000)).current;

  useEffect(() => {
    const track = document.querySelector("#track");

    waveformRef.current = WaveSurfer.create({
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      barMinHeight: 1,
      barHeight: 3,
      cursorWidth: 1,
      container: "#waveform",
      backend: "WebAudio",
      height: 24,
      width: 192,
      progressColor: incoming ? "#9c8d8d" : "#6f8171",
      responsive: true,
      waveColor: incoming ? "#e7e8e9" : "#c5e6c1",
      cursorColor: "transparent",
    });

    waveformRef.current.load(track);

    const wave = waveformRef.current;
    wave.on("audioprocess", throttleFn);
    wave.on("finish", () => {
      setplay(false);
    });

    return () => {
      if (wave) {
        wave.destroy();
      }
    };
  }, [incoming, throttleFn]);

  const handlePlay = () => {
    // if (Url) {
    //   seturlPlay(Url);
    // }
    setplay(!play);
    waveformRef.current.playPause();
  };

  return (
    <div className="max-w-full w-[336px] p-[6px]">
      <div className="mr-[4px] ml-[8px] flex items-center">
        <div className="min-h-[19px] flex-grow pb-[1px]">
          <div className="flex items-center pb-[4px]">
            <div className="relative block w-[34px] h-[34px] mt-[-1px] mr-[12px]">
              <button
                onClick={handlePlay}
                className={`block w-[34px] h-[34px] relative text-message-audio-control-incoming ${
                  !incoming && `text-message-audio-control-outgoing `
                }  `}
              >
                {!play ? <Play /> : <Pause />}
              </button>
            </div>
            <div className="flex-grow flex relative items-center ">
              <div className="left-0 absolute bottom-[-21px] text-[11px] leading-[15px] text-[#8696a0] ">
                {currentTime}
              </div>
              <div id="waveform" className="flex-grow w-[full] h-[24px]" />
              <audio id="track" src={urlPlay} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayer;
