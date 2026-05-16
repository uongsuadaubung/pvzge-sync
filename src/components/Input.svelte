<script lang="ts">
  interface Props {
    value: string;
    type?: "text" | "password" | "email" | "url";
    placeholder?: string;
    id?: string;
    error?: boolean;
    oninput?: (e: Event) => void;
    [key: string]: any;
  }

  let { 
    value = $bindable(), 
    type = "text", 
    placeholder = "", 
    id = "", 
    error = false,
    oninput,
    ...rest 
  }: Props = $props();
</script>

<input
  {id}
  {type}
  {placeholder}
  class:error
  bind:value
  {oninput}
  {...rest}
/>

<style lang="scss">
  input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--text);
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.88rem;
    transition: all 0.2s;

    &::placeholder {
      color: var(--text-dim);
      opacity: 0.5;
    }

    &:focus {
      outline: none;
      border-color: var(--primary-dark);
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.15);
    }

    &.error {
      border-color: var(--error);
      &:focus {
        box-shadow: 0 0 0 2px var(--glow-error);
      }
    }
  }
</style>
