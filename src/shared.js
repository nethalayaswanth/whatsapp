import { toArray } from "react-emoji-render";

export const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm;

export const FormatEmoji = ({ text }) => {

 

  if (typeof text ==='object' ||
    text === undefined ||
    text === null ||
    text === "" ||
    text?.trim().length === 0
  ) {
    return null;
  }
  const content = toArray(text);

  return (
    <>
      {content.map((item, key) => {
        if (typeof item === "string") {
          const isURL = URL_REGEX.test(item);

          if (isURL) {
            return (
              <a
                className="inline text-bubble-read"
                href={item}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item}
              </a>
            );
          }

          return item;
        }

        return (
          <em-emoji
            key={key}
            native={item.props.children}
            style={{ width: "17px" }}
            size="17px"
            set="facebook"
            className="emoji-text"
          ></em-emoji>
        );
      })}
    </>
  );
};
