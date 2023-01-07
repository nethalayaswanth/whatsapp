import data from "@emoji-mart/data/sets/14/facebook.json";
import Picker from "@emoji-mart/react"
import useResizeObserver from "use-resize-observer";



const EmojiPicker = ({ onSelect, width,mobile }) => {


  const perline=Math.floor((width-40)/36)


  console.log('emoji',perline)
  return (
    <div className="h-[320px] relative overflow-hidden rounded-t-[6px]">
      <Picker
        set="facebook"
        enableFrequentEmojiSort
        data={data}
        onEmojiSelect={onSelect}
        previewPosition="none"
        showSkinTones={true}
        defaultSkin={1}
        color="#0F8FF3"
        perLine={perline}
        sheetSize={36}
      />
    </div>
  );
};

export default EmojiPicker;
