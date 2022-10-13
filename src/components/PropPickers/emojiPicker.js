import data from "@emoji-mart/data/sets/14/facebook.json";
import Picker from "@emoji-mart/react"
import { useMemo } from "react";



const EmojiPicker = ({ onSelect }) => {
 
  return (
    <div className="h-[320px] relative overflow-hidden rounded-t-[6px]">
      <Picker
        set="facebook"
        enableFrequentEmojiSort
        data={data}
        onEmojiSelect={onSelect}
        previewPosition='none'
        showSkinTones={true}
        defaultSkin={1}
        color="#0F8FF3"
        perLine={10}
        sheetSize={32}
      />
    </div>
  );
};

export default EmojiPicker;
