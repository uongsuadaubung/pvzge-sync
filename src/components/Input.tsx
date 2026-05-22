interface Props {
  value: string;
  type?: "text" | "password" | "email" | "url";
  placeholder?: string;
  id?: string;
  error?: boolean;
  oninput?: (e: Event) => void;
  onInput?: (e: Event) => void;
  [key: string]: unknown;
}

export default function Input(props: Props) {
  const handleInput = (e: Event) => {
    if (props.onInput) props.onInput(e);
    else if (props.oninput) props.oninput(e);
  };

  return (
    <input
      id={props.id || ""}
      type={props.type || "text"}
      placeholder={props.placeholder || ""}
      class={`custom-input ${props.error ? "error" : ""}`}
      value={props.value}
      onInput={handleInput}
    />
  );
}
