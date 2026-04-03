"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import styled from "styled-components";

function normalizeText(value) {
  return `${value ?? ""}`.trim().toLowerCase();
}

function normalizeOption(option, index) {
  const value = `${option?.value ?? ""}`;
  const label = option?.label ? `${option.label}` : value;
  const description = option?.description ? `${option.description}` : "";
  const badge = option?.badge ? `${option.badge}` : "";
  const keywords = Array.isArray(option?.keywords)
    ? option.keywords.map((keyword) => `${keyword}`)
    : [];

  return {
    badge,
    description,
    disabled: Boolean(option?.disabled),
    id: option?.id ? `${option.id}` : `${value || "option"}-${index}`,
    keywords,
    label,
    searchText: normalizeText([label, description, value, badge, ...keywords].join(" ")),
    value,
  };
}

function getEnabledOptionIndexes(options) {
  return options.reduce((indexes, option, index) => {
    if (!option.disabled) {
      indexes.push(index);
    }

    return indexes;
  }, []);
}

function getNextEnabledOptionIndex(options, currentIndex, direction) {
  const enabledIndexes = getEnabledOptionIndexes(options);

  if (!enabledIndexes.length) {
    return -1;
  }

  if (currentIndex < 0) {
    return direction > 0 ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1];
  }

  const currentEnabledIndex = enabledIndexes.indexOf(currentIndex);

  if (currentEnabledIndex < 0) {
    return direction > 0 ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1];
  }

  const nextEnabledIndex =
    (currentEnabledIndex + direction + enabledIndexes.length) % enabledIndexes.length;

  return enabledIndexes[nextEnabledIndex];
}

const SelectRoot = styled.div`
  min-width: 0;
  position: relative;
  width: 100%;
`;

const HiddenInput = styled.input`
  display: none;
`;

const TriggerButton = styled.button`
  align-items: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(247, 250, 255, 0.96)),
    radial-gradient(circle at top right, rgba(36, 75, 115, 0.06), transparent 55%);
  border: 1px solid ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow:
    0 10px 24px rgba(16, 32, 51, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  color: ${({ theme }) => theme.colors.text};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  min-height: 46px;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  padding: 0.72rem 0.9rem;
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
  width: 100%;

  &:hover {
    border-color: ${({ disabled, theme }) => (disabled ? theme.colors.border : "rgba(36, 75, 115, 0.24)")};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
  }

  &:focus-visible {
    border-color: ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.primary)};
    box-shadow:
      0 16px 30px rgba(16, 32, 51, 0.08),
      0 0 0 4px
        ${({ $invalid }) => ($invalid ? "rgba(180, 35, 24, 0.14)" : "rgba(0, 95, 115, 0.14)")};
    outline: none;
  }
`;

const TriggerValue = styled.span`
  display: grid;
  gap: 0.08rem;
  min-width: 0;
`;

const TriggerLabel = styled.span`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlaceholderText = styled(TriggerLabel)`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 500;
`;

const TriggerAdornment = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.55rem;
`;

const TriggerBadge = styled.span`
  background: rgba(36, 75, 115, 0.08);
  border: 1px solid rgba(36, 75, 115, 0.12);
  border-radius: 999px;
  color: #244b73;
  display: inline-flex;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  max-width: 7.5rem;
  overflow: hidden;
  padding: 0.24rem 0.48rem;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`;

const Caret = styled.span`
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid rgba(74, 90, 117, 0.92);
  flex: 0 0 auto;
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "none")};
  transition: transform 160ms ease;
`;

const Dropdown = styled.div`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.995), rgba(246, 250, 255, 0.985)),
    radial-gradient(circle at top right, rgba(36, 75, 115, 0.09), transparent 58%);
  border: 1px solid rgba(24, 39, 66, 0.1);
  border-radius: 18px;
  box-shadow:
    0 28px 54px rgba(16, 32, 51, 0.14),
    0 6px 16px rgba(16, 32, 51, 0.05);
  display: grid;
  gap: 0.55rem;
  left: 0;
  padding: 0.68rem;
  position: absolute;
  right: 0;
  top: calc(100% + 0.45rem);
  z-index: 80;
`;

const SearchWrap = styled.div`
  align-items: center;
  background: rgba(247, 250, 255, 0.98);
  border: 1px solid rgba(24, 39, 66, 0.08);
  border-radius: 999px;
  display: flex;
  gap: 0.55rem;
  min-height: 40px;
  padding: 0 0.72rem;

  &:focus-within {
    border-color: rgba(36, 75, 115, 0.2);
    box-shadow: 0 0 0 3px rgba(36, 75, 115, 0.09);
  }
`;

const SearchIcon = styled.span`
  border: 2px solid rgba(74, 90, 117, 0.74);
  border-radius: 999px;
  display: inline-block;
  flex: 0 0 auto;
  height: 0.78rem;
  position: relative;
  width: 0.78rem;

  &::after {
    background: rgba(74, 90, 117, 0.74);
    border-radius: 999px;
    content: "";
    height: 2px;
    position: absolute;
    right: -0.2rem;
    bottom: -0.08rem;
    transform: rotate(45deg);
    width: 0.38rem;
  }
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  flex: 1 1 auto;
  font-size: 0.9rem;
  min-width: 0;
  outline: none;
  padding: 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const OptionList = styled.div`
  display: grid;
  gap: 0.28rem;
  max-height: 280px;
  overflow: auto;
  padding-right: 0.1rem;
`;

const OptionButton = styled.button`
  align-items: start;
  background: ${({ $active, $selected }) =>
    $selected
      ? "rgba(0, 95, 115, 0.11)"
      : $active
        ? "rgba(36, 75, 115, 0.08)"
        : "transparent"};
  border: 1px solid
    ${({ $active, $selected }) =>
      $selected
        ? "rgba(0, 95, 115, 0.18)"
        : $active
          ? "rgba(36, 75, 115, 0.14)"
          : "transparent"};
  border-radius: 14px;
  color: ${({ theme }) => theme.colors.text};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  display: grid;
  gap: 0.18rem;
  justify-items: start;
  min-height: 0;
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
  padding: 0.72rem 0.78rem;
  text-align: left;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
  width: 100%;

  &:hover {
    background: ${({ disabled }) => (disabled ? "transparent" : "rgba(36, 75, 115, 0.08)")};
    border-color: ${({ disabled }) => (disabled ? "transparent" : "rgba(36, 75, 115, 0.14)")};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-1px)")};
  }
`;

const OptionRow = styled.span`
  align-items: start;
  display: flex;
  gap: 0.6rem;
  justify-content: space-between;
  width: 100%;
`;

const OptionMeta = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.45rem;
`;

const OptionText = styled.span`
  display: grid;
  gap: 0.12rem;
  min-width: 0;
`;

const OptionLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OptionDescription = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: normal;
`;

const OptionBadge = styled.span`
  background: rgba(36, 75, 115, 0.08);
  border: 1px solid rgba(36, 75, 115, 0.12);
  border-radius: 999px;
  color: #244b73;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  max-width: 8rem;
  overflow: hidden;
  padding: 0.22rem 0.46rem;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`;

const OptionIndicator = styled.span`
  background: ${({ $selected }) => ($selected ? "rgba(0, 95, 115, 0.92)" : "rgba(74, 90, 117, 0.18)")};
  border-radius: 999px;
  box-shadow: ${({ $selected }) => ($selected ? "0 0 0 4px rgba(0, 95, 115, 0.12)" : "none")};
  display: inline-flex;
  flex: 0 0 auto;
  height: 0.58rem;
  width: 0.58rem;
`;

const StateMessage = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
  line-height: 1.55;
  padding: 0.28rem 0.4rem;
`;

export default function SearchableSelect({
  ariaLabel,
  defaultValue = "",
  disabled = false,
  emptyMessage = "No options found.",
  id,
  invalid = false,
  loading = false,
  loadingMessage = "Loading options...",
  name,
  onChange,
  options = [],
  placeholder = "Select an option",
  searchPlaceholder = "Search options",
  value,
}) {
  const generatedId = useId();
  const resolvedId = id || generatedId;
  const listboxId = `${resolvedId}-listbox`;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const normalizedOptions = useMemo(
    () => options.map((option, index) => normalizeOption(option, index)),
    [options],
  );
  const resolvedValue = value !== undefined ? value : internalValue;
  const selectedOption =
    normalizedOptions.find((option) => option.value === `${resolvedValue ?? ""}`) || null;
  const normalizedQuery = normalizeText(query);
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return normalizedOptions;
    }

    return normalizedOptions.filter((option) => option.searchText.includes(normalizedQuery));
  }, [normalizedOptions, normalizedQuery]);
  const resolvedActiveIndex = useMemo(() => {
    if (!filteredOptions.length) {
      return -1;
    }

    if (activeIndex >= 0 && filteredOptions[activeIndex] && !filteredOptions[activeIndex].disabled) {
      return activeIndex;
    }

    const selectedIndex = filteredOptions.findIndex((option) => option.value === `${resolvedValue ?? ""}`);

    return selectedIndex >= 0 && !filteredOptions[selectedIndex]?.disabled
      ? selectedIndex
      : getNextEnabledOptionIndex(filteredOptions, -1, 1);
  }, [activeIndex, filteredOptions, resolvedValue]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, [isOpen]);

  function closeMenu(restoreFocus = false) {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function openMenu(direction = 1) {
    if (disabled) {
      return;
    }

    setIsOpen(true);
    setQuery("");
    setActiveIndex(() => {
      const selectedIndex = normalizedOptions.findIndex((option) => option.value === `${resolvedValue ?? ""}`);

      if (selectedIndex >= 0 && !normalizedOptions[selectedIndex]?.disabled) {
        return selectedIndex;
      }

      return getNextEnabledOptionIndex(normalizedOptions, -1, direction);
    });
  }

  function commitSelection(option) {
    if (!option || option.disabled) {
      return;
    }

    if (value === undefined) {
      setInternalValue(option.value);
    }

    onChange?.(option.value, option);
    closeMenu();
  }

  function handleTriggerKeyDown(event) {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(-1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen) {
        closeMenu();
        return;
      }

      openMenu(1);
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((currentIndex) => getNextEnabledOptionIndex(filteredOptions, currentIndex, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((currentIndex) => getNextEnabledOptionIndex(filteredOptions, currentIndex, -1));
      return;
    }

    if (event.key === "Enter") {
      const activeOption =
        filteredOptions[resolvedActiveIndex] || filteredOptions.find((option) => !option.disabled);

      if (activeOption) {
        event.preventDefault();
        commitSelection(activeOption);
      }
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
    }
  }

  return (
    <SelectRoot ref={containerRef}>
      {name ? <HiddenInput name={name} type="hidden" value={resolvedValue || ""} /> : null}
      <TriggerButton
        $invalid={invalid}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        id={resolvedId}
        onClick={() => (isOpen ? closeMenu() : openMenu(1))}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <TriggerValue>
          {selectedOption ? (
            <TriggerLabel>{selectedOption.label}</TriggerLabel>
          ) : (
            <PlaceholderText>{placeholder}</PlaceholderText>
          )}
        </TriggerValue>
        <TriggerAdornment>
          {selectedOption?.badge ? <TriggerBadge>{selectedOption.badge}</TriggerBadge> : null}
          <Caret $open={isOpen} aria-hidden="true" />
        </TriggerAdornment>
      </TriggerButton>

      {isOpen ? (
        <Dropdown>
          <SearchWrap>
            <SearchIcon aria-hidden="true" />
            <SearchInput
              aria-label={searchPlaceholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              ref={searchInputRef}
              type="search"
              value={query}
            />
          </SearchWrap>

          {loading ? (
            <StateMessage>{loadingMessage}</StateMessage>
          ) : filteredOptions.length ? (
            <OptionList id={listboxId} role="listbox">
              {filteredOptions.map((option, index) => {
                const isSelected = option.value === `${resolvedValue ?? ""}`;

                return (
                  <OptionButton
                    $active={index === resolvedActiveIndex}
                    $selected={isSelected}
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    key={option.id}
                    onClick={() => commitSelection(option)}
                    onMouseEnter={() => {
                      if (!option.disabled) {
                        setActiveIndex(index);
                      }
                    }}
                    role="option"
                    tabIndex={-1}
                    type="button"
                  >
                    <OptionRow>
                      <OptionText>
                        <OptionLabel>{option.label}</OptionLabel>
                        {option.description ? (
                          <OptionDescription>{option.description}</OptionDescription>
                        ) : null}
                      </OptionText>
                      <OptionMeta>
                        {option.badge ? <OptionBadge>{option.badge}</OptionBadge> : null}
                        <OptionIndicator $selected={isSelected} aria-hidden="true" />
                      </OptionMeta>
                    </OptionRow>
                  </OptionButton>
                );
              })}
            </OptionList>
          ) : (
            <StateMessage>{emptyMessage}</StateMessage>
          )}
        </Dropdown>
      ) : null}
    </SelectRoot>
  );
}
