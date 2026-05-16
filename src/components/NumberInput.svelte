<script lang="ts">
  interface Props {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    id?: string;
    onchange?: (val: number) => void;
  }

  let { 
    value = $bindable(), 
    min = 0, 
    max = Infinity, 
    step = 1,
    id = "",
    onchange
  }: Props = $props();

  function decrease() {
    value = Math.max(min, value - step);
    onchange?.(value);
  }

  function increase() {
    value = Math.min(max, value + step);
    onchange?.(value);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value);
    if (!isNaN(val)) {
      value = Math.max(min, Math.min(max, val));
      onchange?.(value);
    }
  }
</script>

<div class="number-stepper">
  <button
    type="button"
    class="stepper-btn"
    onclick={decrease}
    disabled={value <= min}
    aria-label="Decrease"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>
  <input
    type="number"
    {id}
    value={value}
    {min}
    {max}
    oninput={handleInput}
  />
  <button
    type="button"
    class="stepper-btn"
    onclick={increase}
    disabled={value >= max}
    aria-label="Increase"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>
</div>

<style lang="scss">
  .number-stepper {
    display: flex;
    align-items: center;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    width: fit-content;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
      border-color: var(--primary-dark);
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.15);
    }

    input {
      width: 50px;
      border: none;
      border-radius: 0;
      text-align: center;
      padding: 8px 4px;
      background: transparent;
      box-shadow: none;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      
      appearance: textfield;
      -moz-appearance: textfield;
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &:focus {
        outline: none;
        border: none;
        box-shadow: none;
      }
    }

    .stepper-btn {
      background: var(--surface-light);
      border: none;
      color: var(--text-dim);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;

      &:hover {
        background: var(--primary-dark);
        color: var(--bg);
      }

      &:active {
        background: var(--primary);
      }
      
      &:first-child {
        border-right: 1px solid var(--border);
      }
      
      &:last-child {
        border-left: 1px solid var(--border);
      }
      
      svg {
        width: 16px;
        height: 16px;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
          background: var(--surface-light);
          color: var(--text-dim);
        }
      }
    }
  }
</style>

