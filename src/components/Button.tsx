import type { JSX } from "solid-js";

interface Props {
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "outline"
    | "link"
    | "back"
    | "settings";
  fullWidth?: boolean;
  disabled?: boolean;
  class?: string;
  onclick?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
  title?: string;
  style?: string | JSX.CSSProperties;
  children?: JSX.Element;
  [key: string]: unknown;
}

export default function Button(props: Props) {
  const handleClick = (e: MouseEvent) => {
    if (props.onClick) props.onClick(e);
    else if (props.onclick) props.onclick(e);
  };

  return (
    <button
      type={props.type || "button"}
      class={`btn ${props.variant || "primary"} ${
        props.fullWidth ? "full-width" : ""
      } ${props.class || ""}`}
      disabled={props.disabled}
      onClick={handleClick}
      title={props.title}
      style={props.style}
    >
      {props.children}
    </button>
  );
}
