/* eslint-disable react/display-name */
/* eslint-disable max-len */
/* eslint-disable import/no-named-as-default-member */
import { Listbox } from '@headlessui/react'
import { useId } from '@reach/auto-id'
import { Portal } from '@reach/portal'
import { CSS, styled, useThemeOverrides } from '@truepill/capsule-utils'
import { Text, TextProps } from '@truepill/react-capsule'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import type { ReactElement } from 'react'
import React, { useRef } from 'react'
import { ChevronDown } from 'react-feather'

type SelectState = 'default' | 'complete' | 'error'
type OptionComponent<T> = ({ option, isHighlighted, isDisabled }: { option: T; isHighlighted: boolean; isDisabled: boolean }) => ReactElement
type OptionDisabled<T> = (option: T) => boolean
interface SelectInterface {
  <T>(props: SelectProps<T>): ReactElement | null
}
interface SelectProps<T> {
  /**
   * Options available for the user to select. This can be a string or an object. If given as an object, the selectedKey prop must be provided.
   */
  options: T[]
  /**
   * Determine the height of Select.
   */
  variant?: 'small' | 'large'
  /**
   * Configure the label text to be shown above the input.
   */
  label: string
  /**
   * Text to show if no option has been selected.
   */
  placeholder?: string
  /**
   * Determine the styling of the input. Useful for validation.
   */
  state?: SelectState
  /**
   // eslint-disable-next-line max-len
   * Allow the customization of the component being rendered as an option. Gives access to the options, as well as an `isHighlighted` boolean, which determines if the element is currently highlighted by the user and `isDisabled`, which determines if the element is disabled and unavailable for selection.
   */
  optionComponent?: OptionComponent<T>
  /**
   * Allow the customization of when an option is disabled and unavailable for selection. Gives the selected option as an argument.
   */
  isOptionDisabled?: OptionDisabled<T>
  /**
   * Used along with value to control Select. Gives the selected option as an argument rather than an event object.
   */
  onChange: (change?: T) => void
  /**
   * Use this to control the value shown in the input.
   */
  value: T
  /**
   * If the items passed to the `options` prop are objects, this determines the item in the object to display when the user selects an item.
   */
  selectedKey?: T extends any ? keyof T : never
  /**
   * Text to show under the input. Will be styled according to the `state` prop
   */
  helperText?: string
  /**
   * Updates styling of the input to show it is required.
   */
  required?: boolean
  /**
   * ID of the element.
   */
  id?: string
  /**
   * A start Adornment to display on the button that triggers the opening of the dropdown.
   */
  startAdornment?: ({ open }: { open: boolean }) => ReactElement
  /**
   * An end Adornment to display on the button that triggers the opening of the dropdown. This will replace the default chevron.
   */
  endAdornment?: ({ open }: { open: boolean }) => ReactElement
  /**
   * ClassName for root component
   */
  className?: string
  /**
   * Whether the Select options list should render in a `Portal` (default: `false`)
   */
  portalled?: boolean
  css?: CSS
  triggerCss?: CSS
}

const OpenButton = styled('button', {
  fontSize: '$md',
  width: '100%',
  height: '56px',
  background: '$$select-field-background',
  padding: '0 1rem',
  textAlign: 'left',
  border: '$$select-field-outline',
  borderRadius: '$sm',
  svg: {
    transition: 'transform 0.2s ease-out',
  },
  '&:active': {
    border: '$$select-field-outline-focus',
    padding: '0 calc(1rem - 2px)',
  },
  '&:focus': {
    backgroundColor: '$white',
    outline: 'none',
    padding: ' 0 calc(1rem - 2px)',
    border: '$$select-field-outline-focus',
  },

  "&[data-active='true']": {
    outline: 'none',
    border: '$$select-field-outline-focus',
    padding: '0 calc(1rem - 2px)',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 6px 8px rgba(50, 50, 93, 0.22)',
  },
  variants: {
    variant: {
      small: {
        height: '44px',
      },
      large: {},
    },
  },
})

const StyledAlert = styled('svg', {
  display: 'none',
  size: '24px',
  fill: '$functional-error-dark',
})

const StyledCheck = styled('svg', {
  display: 'none',
  width: '24px',
  fill: '$functional-success-dark',
})

const IconWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
})

const HelperText = styled(Text, {
  marginTop: '$2xs',
  display: 'inline-flex',
  alignItems: 'center',
  variants: {
    state: {
      default: {},
      complete: {},
      error: {
        color: '$functional-error-dark',
      },
    },
  },
})

const OptionListItem = styled('div', {
  padding: '0.5rem 1rem',
  position: 'relative',
  cursor: 'pointer',
})

const ListBackground = styled(motion.div, {
  position: 'absolute',
  top: 0,
  left: 0,
  size: '100%',
  zIndex: -1,
  backgroundColor: '$primary-300',
})

const OptionsList = styled(motion.ul, {
  position: 'absolute',
  width: '100%',
  zIndex: 1000,
  borderRadius: '$sm',
  padding: '0.5rem 0',
  maxHeight: '18.5rem',
  overflow: 'hidden',
  overflowY: 'auto',
  outline: 'none',
  margin: 0,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 6px 8px rgba(50, 50, 93, 0.22)',
  background: '$white',
})

const SelectWrapper = styled('div', {
  position: 'relative',
  width: '100%',

  variants: {
    state: {
      default: {
        '$$select-field-outline': '1px solid $colors$gray-700',
        '$$select-field-outline-focus': '3px solid $colors$primary-500',
        '$$select-field-background': '$colors$white',
      },
      complete: {
        '$$select-field-outline': '1px solid $colors$gray-500',
        '$$select-field-outline-focus': '3px solid $colors$primary-500',
        '$$select-field-background': '$colors$gray-100',
        [`& ${StyledCheck}`]: {
          display: 'inline-block',
          marginLeft: '0.25rem',
        },
      },
      error: {
        '$$select-field-outline': '$space$4xs solid $colors$functional-error-dark',
        '$$select-field-outline-focus': '3px solid $colors$functional-error-dark',
        '$$select-field-background': '$colors$white',
        [`& ${StyledAlert}`]: {
          display: 'inline-block',
          marginLeft: '0.25rem',
        },
      },
    },
  },
})

const ButtonTextArea = styled('div', {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  overflow: 'hidden',
  width: '100%',
  '& *:first-child': {
    marginLeft: '0px',
    whiteSpace: 'nowrap',
  },
  '& *': {
    marginLeft: '8px',
    whiteSpace: 'nowrap',
  },
})
const ButtonArea = styled('div', {
  display: 'flex',
  width: 'hidden',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  justifyContent: 'space-between',
  alignItems: 'center',
})

const PortalledBackground = styled('div', {
  size: '100%',
  position: 'fixed',
  top: 0,
})

const PortalledContainer = styled('div', {
  position: 'absolute',
  width: '100%',
  maxWidth: '250px',
})

const SpaceWrapper = styled('div', {
  marginBottom: '$xs',
})

const MotionChevron = motion(ChevronDown)

const Label = React.forwardRef((props: TextProps, forwardedRef: React.ForwardedRef<HTMLLabelElement>) => {
  return <Text as='label' variant='body' bold {...props} ref={forwardedRef} />
})

/**
 * Custom aria compliant select dropdown component. Also handles the showing of a label, and any validation messages.
 */
export const Select: SelectInterface = React.forwardRef(
  (
    {
      options,
      label,
      optionComponent,
      isOptionDisabled = () => false,
      onChange,
      value,
      selectedKey,
      placeholder = '',
      state = 'default',
      helperText,
      variant = 'large',
      startAdornment: StartAdornment,
      endAdornment: EndAdornment,
      className,
      portalled = false,
      css,
      triggerCss,
    },
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const buttonRef = useRef<HTMLButtonElement>()
    const uniqueId = useId()
    const overrides = useThemeOverrides('select')
    const triggerOverrides = useThemeOverrides('selectTrigger')

    function isString(val: unknown): val is string {
      return typeof val === 'string'
    }
    function isObject(val: unknown): val is typeof options[0] {
      return typeof val === 'object' && val !== null
    }

    const determineText = (item: unknown) => {
      if (!options.length) return placeholder
      if (isString(item) && item.length > 0) return item
      if (isObject(item) && selectedKey) return item[selectedKey]
      return placeholder
    }

    const OptionsListComponent = (
      <AnimateSharedLayout>
        <Listbox.Options layout static>
          {options.map((option, index) => {
            const isDisabled = isOptionDisabled(option)
            return (
              <Listbox.Option key={index} value={option} disabled={isDisabled}>
                {({ active }) => {
                  const OptionComponent = () =>
                    optionComponent ? (
                      optionComponent({
                        option,
                        isHighlighted: active,
                        isDisabled,
                      })
                    ) : (
                      <Text variant='body-sm' lineThrough={isDisabled}>
                        Option Component - {determineText(option)}
                      </Text>
                    )
                  return (
                    <OptionListItem>
                      {active && (
                        <ListBackground
                          layoutId='background'
                          animate={{
                            opacity: 1,
                          }}
                          initial={false}
                          transition={{
                            duration: 0.3,
                            type: 'spring',
                          }}
                        />
                      )}
                      <OptionComponent />
                      <Text variant='body-sm' lineThrough={isDisabled}>
                        Custom Text - {determineText(option)}
                      </Text>
                    </OptionListItem>
                  )
                }}
              </Listbox.Option>
            )
          })}
        </Listbox.Options>
      </AnimateSharedLayout>
    )

    return (
      <SelectWrapper state={state} css={{ ...overrides, ...css }}>
        <Listbox value={value} onChange={onChange} as='div' ref={ref} className={className}>
          {({ open }) => (
            <>
              <Listbox.Label as={Label}>
                <SpaceWrapper data-label-space>{label}</SpaceWrapper>
              </Listbox.Label>
              <OpenButton
                as={Listbox.Button}
                variant={variant}
                data-active={open}
                css={{
                  ...triggerOverrides,
                  ...triggerCss,
                }}
                // @ts-expect-error - ref type from motion is incorrect
                ref={buttonRef}
                aria-describedby={helperText ? uniqueId : undefined}
              >
                <ButtonArea>
                  <ButtonTextArea>
                    {!!StartAdornment && <StartAdornment open={open} />}
                    <Text>{determineText(value)}</Text>
                  </ButtonTextArea>
                  <IconWrapper>
                    {!EndAdornment && <MotionChevron animate={open ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 0.02 }} />}
                    {!!EndAdornment && <EndAdornment open={open} />}
                    <StyledAlert viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                      <p>Error Circle</p>
                    </StyledAlert>

                    <StyledCheck xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </StyledCheck>
                  </IconWrapper>
                </ButtonArea>
              </OpenButton>
              <AnimatePresence>
                {open &&
                  (portalled ? (
                    <Portal>
                      <>
                        <PortalledBackground />
                        <PortalledContainer
                          css={{
                            left: buttonRef.current && buttonRef.current.getBoundingClientRect().left,
                            top: buttonRef.current && buttonRef.current.getBoundingClientRect().bottom + window.scrollY,
                          }}
                        >
                          {OptionsListComponent}
                        </PortalledContainer>
                      </>
                    </Portal>
                  ) : (
                    OptionsListComponent
                  ))}
              </AnimatePresence>
            </>
          )}
        </Listbox>
        {helperText && (
          <HelperText id={uniqueId} state={state} variant='body-sm' bold>
            {helperText}
          </HelperText>
        )}
      </SelectWrapper>
    )
  }
)
