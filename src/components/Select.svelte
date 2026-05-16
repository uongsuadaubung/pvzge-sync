<script lang="ts">
  import { onMount } from "svelte";

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

  let { 
    value = $bindable(), 
    options = [], 
    id = "",
    onchange
  }: Props = $props();

  let isOpen = $state(false);
  let selectedLabel = $derived(options.find(opt => opt.value === value)?.label || "");

  function toggle() {
    isOpen = !isOpen;
  }

  function selectOption(opt: Option) {
    value = opt.value;
    isOpen = false;
    onchange?.(value);
  }

  function handleOutsideClick(e: MouseEvent) {
    if (isOpen && !(e.target as HTMLElement).closest(".custom-select")) {
      isOpen = false;
    }
  }

  onMount(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  });
</script>

<div class="custom-select {isOpen ? 'is-open' : ''}" {id}>
  <button type="button" class="select-trigger" onclick={toggle}>
    <span>{selectedLabel}</span>
    <div class="select-arrow">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </button>

  {#if isOpen}
    <ul class="options-list" role="listbox" id="listbox-{id}">
      {#each options as opt}
        <li 
          class="option-item {opt.value === value ? 'selected' : ''}" 
          onclick={() => selectOption(opt)}
          onkeydown={(e) => e.key === 'Enter' && selectOption(opt)}
          role="option"
          aria-selected={opt.value === value}
          tabindex="0"
        >
          {opt.label}
          {#if opt.value === value}
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
  .custom-select {
    position: relative;
    width: 100%;
    user-select: none;

    .select-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text);
      font-family: inherit;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;

      &:focus {
        outline: none;
        border-color: var(--primary-dark);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.15);
      }

      .select-arrow {
        width: 16px;
        height: 16px;
        color: var(--text-dim);
        transition: transform 0.2s;
        
        svg { width: 100%; height: 100%; }
      }
    }

    &.is-open {
      .select-trigger {
        border-color: var(--primary-dark);
        .select-arrow { transform: rotate(180deg); }
      }
    }

    .options-list {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin: 0;
      padding: 5px;
      list-style: none;
      z-index: 100;
      box-shadow: 0 10px 25px var(--shadow-dark);
      animation: slideIn 0.15s ease-out;

      .option-item {
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.88rem;
        color: var(--text-dim);
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.15s;
        outline: none;

        &:hover, &:focus {
          background: var(--surface-light);
          color: var(--text);
        }

        &.selected {
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          font-weight: 600;
        }

        .check-icon {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
