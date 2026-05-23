import { createSignal, For, onCleanup, onMount } from "solid-js";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  id?: string;
  onchange?: (val: string) => void;
}

export default function Select(props: Props) {
  const [isOpen, setIsOpen] = createSignal(false);

  const selectedLabel = () => {
    return props.options.find((opt) => opt.value === props.value)?.label || "";
  };

  function toggle() {
    setIsOpen(!isOpen());
  }

  function selectOption(opt: Option) {
    setIsOpen(false);
    props.onchange?.(opt.value);
  }

  function handleOutsideClick(e: MouseEvent) {
    const target = e.target;
    if (
      isOpen() && target instanceof HTMLElement &&
      !target.closest(".custom-select")
    ) {
      setIsOpen(false);
    }
  }

  onMount(() => {
    window.addEventListener("click", handleOutsideClick);
    onCleanup(() => {
      window.removeEventListener("click", handleOutsideClick);
    });
  });

  return (
    <div
      class={`custom-select ${isOpen() ? "is-open" : ""}`}
      id={props.id || ""}
    >
      <button type="button" class="select-trigger" onClick={toggle}>
        <span>{selectedLabel()}</span>
        <div class="select-arrow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen() && (
        <ul
          class="options-list"
          role="listbox"
          id={`listbox-${props.id || ""}`}
        >
          <For each={props.options}>
            {(opt) => (
              <li
                class={`option-item ${
                  opt.value === props.value ? "selected" : ""
                }`}
                onClick={() => selectOption(opt)}
                onKeyDown={(e) => e.key === "Enter" && selectOption(opt)}
                role="option"
                aria-selected={opt.value === props.value}
                tabindex="0"
              >
                {opt.label}
                {opt.value === props.value && (
                  <svg
                    class="check-icon"
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
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  );
}
