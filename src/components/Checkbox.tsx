interface Props {
  checked: boolean;
  label?: string;
  id?: string;
  onchange?: (val: boolean) => void;
}

export default function Checkbox(props: Props) {
  function toggle() {
    props.onchange?.(!props.checked);
  }

  return (
    <button
      type="button"
      class={`custom-checkbox-container ${props.checked ? "checked" : ""}`}
      id={props.id || ""}
      onClick={toggle}
      role="checkbox"
      aria-checked={props.checked}
    >
      <div class="box">
        {props.checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        )}
      </div>
      {props.label && <span class="label-text">{props.label}</span>}
    </button>
  );
}
