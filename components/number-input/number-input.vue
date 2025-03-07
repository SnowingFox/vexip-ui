<template>
  <div
    :id="idFor"
    ref="wrapper"
    :class="className"
    @click="input?.focus()"
  >
    <div
      v-if="hasPrefix"
      :class="[nh.be('icon'), nh.be('prefix')]"
      :style="{ color: props.prefixColor }"
      @click="handlePrefixClick"
    >
      <slot name="prefix">
        <Icon :icon="props.prefix"></Icon>
      </slot>
    </div>
    <input
      ref="input"
      type="text"
      :class="[nh.be('control'), inputClass]"
      :value="inputValue"
      :autofocus="props.autofocus"
      :autocomplete="props.autocomplete ? 'on' : 'off'"
      :spellcheck="props.spellcheck"
      :disabled="props.disabled"
      :readonly="isReadonly"
      :placeholder="props.placeholder ?? locale.placeholder"
      role="spinbutton"
      :aria-valuenow="preciseNumber"
      :aria-valuemin="props.min !== -Infinity ? props.min : undefined"
      :aria-valuemax="props.max !== Infinity ? props.max : undefined"
      @blur="handleBlur"
      @focus="handleFocus"
      @keypress="handleKeyPress"
      @input="handleInput"
      @change="handleChange"
    />
    <div
      v-if="hasSuffix"
      :class="[nh.be('icon'), nh.be('suffix')]"
      :style="{
        color: props.suffixColor,
        opacity: showClear || props.loading ? '0%' : ''
      }"
      @click="handleSuffixClick"
    >
      <slot name="suffix">
        <Icon :icon="props.suffix"></Icon>
      </slot>
    </div>
    <div
      v-else-if="props.clearable || props.loading"
      :class="[nh.be('icon'), nh.bem('icon', 'placeholder'), nh.be('suffix')]"
    ></div>
    <transition :name="nh.ns('fade')" appear>
      <div v-if="showClear" :class="[nh.be('icon'), nh.be('clear')]" @click.stop="handleClear">
        <Icon><CircleXmark></CircleXmark></Icon>
      </div>
      <div v-else-if="props.loading" :class="[nh.be('icon'), nh.be('loading')]">
        <Icon
          :spin="props.loadingSpin"
          :pulse="!props.loadingSpin"
          :icon="props.loadingIcon"
        ></Icon>
      </div>
    </transition>
    <template v-if="props.controlType !== 'none'">
      <div :class="nh.be('plus')" @click="plusNumber" @mousedown.prevent>
        <Icon :scale="0.8">
          <CaretUp></CaretUp>
        </Icon>
      </div>
      <div :class="nh.be('minus')" @click="minusNumber" @mousedown.prevent>
        <Icon :scale="0.8">
          <CaretDown></CaretDown>
        </Icon>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { Icon } from '@/components/icon'
import { useFieldStore } from '@/components/form'
import { useHover, useModifier } from '@vexip-ui/hooks'
import {
  useNameHelper,
  useProps,
  useLocale,
  createSizeProp,
  createStateProp,
  emitEvent
} from '@vexip-ui/config'
import {
  isNull,
  toFixed,
  toNumber,
  boundRange,
  throttle,
  debounce,
  plus,
  minus
} from '@vexip-ui/utils'
import { CaretUp, CaretDown, CircleXmark, Spinner } from '@vexip-ui/icons'
import { numberInputProps } from './props'

type InputEventType = 'input' | 'change'

const isNullOrNaN = (value: unknown) => isNull(value) || Number.isNaN(value)

export default defineComponent({
  name: 'NumberInput',
  components: {
    Icon,
    CaretUp,
    CaretDown,
    CircleXmark
  },
  props: numberInputProps,
  emits: ['update:value'],
  setup(_props, { slots, emit }) {
    const {
      idFor,
      state,
      disabled,
      loading,
      size,
      validateField,
      clearField,
      getFieldValue,
      setFieldValue
    } = useFieldStore<number>(focus)

    const props = useProps('numberInput', _props, {
      size: createSizeProp(size),
      state: createStateProp(state),
      prefix: null,
      prefixColor: '',
      suffix: null,
      suffixColor: '',
      // 格式化后显示
      formatter: {
        default: null,
        isFunc: true
      },
      value: {
        default: () => getFieldValue(null!),
        static: true
      },
      min: -Infinity,
      max: Infinity,
      placeholder: null,
      autofocus: false,
      spellcheck: false,
      autocomplete: false,
      precision: 0,
      readonly: false,
      step: 1,
      ctrlStep: 100,
      shiftStep: 10,
      altStep: 0.1,
      disabled: () => disabled.value,
      inputClass: null,
      debounce: false,
      clearable: false,
      loading: () => loading.value,
      loadingIcon: Spinner,
      loadingLock: false,
      loadingSpin: false,
      sync: false,
      controlType: 'right'
    })

    const nh = useNameHelper('number-input')
    const focused = ref(false)
    const currentValue = ref(props.value)
    const inputting = ref(false)

    const inputControl = ref<HTMLInputElement>()
    const { wrapper, isHover } = useHover()

    useModifier({
      target: inputControl,
      passive: false,
      onKeyDown: (event, modifier) => {
        emitEvent(props.onKeyDown, event)

        if (modifier.up || modifier.down) {
          event.preventDefault()
          changeStep(
            modifier.up ? 'plus' : 'minus',
            event.ctrlKey ? 'ctrl' : event.shiftKey ? 'shift' : event.altKey ? 'alt' : undefined
          )
          modifier.resetAll()
        } else if (modifier.enter) {
          event.preventDefault()
          emitChangeEvent('change')
          modifier.resetAll()
        }
      },
      onKeyUp: event => {
        emitEvent(props.onKeyUp, event)

        if (event.key === 'Enter') {
          handleEnter()
        }
      }
    })

    let lastValue: number | null = props.value

    const className = computed(() => {
      const [display, fade] = (props.controlType || 'right').split('-')

      return [
        nh.b(),
        nh.ns('input-vars'),
        {
          [nh.bm('inherit')]: props.inherit,
          [nh.bm('focused')]: focused.value,
          [nh.bm('disabled')]: props.disabled,
          [nh.bm('loading')]: props.loading && props.loadingLock,
          [nh.bm(props.size)]: props.size !== 'default',
          [nh.bm(props.state)]: props.state !== 'default',
          [nh.bm(`control-${display}`)]: display !== 'right',
          [nh.bm('control-fade')]: fade
        }
      ]
    })
    const hasPrefix = computed(() => {
      return !!(slots.prefix || props.prefix)
    })
    const hasSuffix = computed(() => {
      return !!(slots.suffix || props.suffix)
    })
    const inputStyle = computed(() => {
      return {
        paddingLeft: hasPrefix.value ? '2em' : '',
        paddingRight: hasSuffix.value ? '2em' : ''
      }
    })
    const preciseNumber = computed(() => {
      return !inputting.value && typeof currentValue.value === 'number' && props.precision > 0
        ? toFixed(currentValue.value, props.precision)
        : currentValue.value
    })
    const formattedValue = computed(() => {
      if (typeof preciseNumber.value !== 'number') return preciseNumber.value ?? ''

      return typeof props.formatter === 'function'
        ? props.formatter(preciseNumber.value)
        : preciseNumber.value.toString()
    })
    const plusDisabled = computed(() => {
      return !isNullOrNaN(currentValue.value) && currentValue.value >= props.max
    })
    const minusDisabled = computed(() => {
      return !isNullOrNaN(currentValue.value) && currentValue.value <= props.min
    })
    const hasValue = computed(() => {
      return currentValue.value || currentValue.value === 0
    })
    const showClear = computed(() => {
      return !props.disabled && props.clearable && isHover.value && hasValue.value
    })
    const inputValue = computed(() => {
      if (Number.isNaN(currentValue.value)) {
        return ''
      }

      return focused.value ? preciseNumber.value : formattedValue.value
    })
    const isReadonly = computed(() => (props.loading && props.loadingLock) || props.readonly)
    const controlFade = computed(() => props.controlType?.endsWith('fade'))

    watch(
      () => props.value,
      value => {
        currentValue.value = isNull(value) ? NaN : value
        lastValue = currentValue.value
      }
    )

    function focus() {
      inputControl.value && inputControl.value.focus()
    }

    function handleFocus(event: FocusEvent) {
      focused.value = true
      inputting.value = true
      emitEvent(props.onFocus, event)
    }

    function handleBlur(event: FocusEvent) {
      focused.value = false

      setTimeout(() => {
        if (!focused.value) {
          inputting.value = false
          emitEvent(props.onBlur, event)
          emitChangeEvent('change')
        }
      }, 120)
    }

    function plusNumber(event: MouseEvent) {
      if (plusDisabled.value) {
        return
      }

      !focused.value && focus()
      changeStep(
        'plus',
        event.ctrlKey ? 'ctrl' : event.shiftKey ? 'shift' : event.altKey ? 'alt' : undefined
      )
    }

    function minusNumber(event: MouseEvent) {
      if (minusDisabled.value) {
        return
      }

      !focused.value && focus()
      changeStep(
        'minus',
        event.ctrlKey ? 'ctrl' : event.shiftKey ? 'shift' : event.altKey ? 'alt' : undefined
      )
    }

    function changeStep(type: 'plus' | 'minus', modifier?: 'ctrl' | 'shift' | 'alt') {
      if (props.disabled || (props.loading && props.loadingLock)) {
        return
      }

      let value = currentValue.value || 0
      let step!: number

      switch (modifier) {
        case 'ctrl':
          step = props.ctrlStep
          break
        case 'shift':
          step = props.shiftStep
          break
        case 'alt':
          step = props.altStep
          break
        default:
          step = props.step
      }

      const stringValue = value.toString().trim()

      if (stringValue.endsWith('.')) {
        value = toNumber(stringValue.slice(0, -1))
      }

      if (type === 'plus') {
        value = plus(value, step)
      } else {
        value = minus(value, step)
      }

      setValue(value, 'input')
    }

    function handleChange(event: Event) {
      const type = event.type as InputEventType
      const stringValue = (event.target as HTMLInputElement).value

      let value = stringValue

      if (!/^-?[0-9]*\.?[0-9]*$/.test(stringValue)) {
        const floatValue = parseFloat(stringValue)

        if (Number.isNaN(floatValue)) {
          value = ''
        } else {
          value = floatValue.toString()
        }

        (event.target as HTMLInputElement).value = value
      }

      inputting.value = type === 'input'

      setValue(toNumber(value), type)
    }

    function setValue(value: number, type: InputEventType) {
      if (type !== 'input') {
        currentValue.value = boundRange(value, props.min, props.max)
      } else {
        currentValue.value = value
      }

      emitChangeEvent(type)
    }

    function emitChangeEvent(type: InputEventType) {
      type = type === 'input' ? 'input' : 'change'

      if (type === 'change') {
        if (lastValue === currentValue.value) return

        lastValue = currentValue.value

        setFieldValue(currentValue.value!)
        emitEvent(props.onChange, currentValue.value)

        if (!props.sync) {
          emit('update:value', currentValue.value)
          validateField()
        }
      } else {
        emitEvent(props.onInput, currentValue.value!)

        if (props.sync) {
          emit('update:value', currentValue.value)
          validateField()
        }
      }
    }

    function handleClear() {
      setValue(NaN, 'change')

      if (props.sync) {
        emit('update:value', currentValue.value)
        validateField()
      }

      emitEvent(props.onClear)
      clearField()
    }

    function handleEnter() {
      emitEvent(props.onEnter)
    }

    function handlePrefixClick(event: MouseEvent) {
      emitEvent(props.onPrefixClick, event)
    }

    function handleSuffixClick(event: MouseEvent) {
      emitEvent(props.onSuffixClick, event)
    }

    function handleKeyPress(event: KeyboardEvent) {
      emitEvent(props.onKeyPress, event)
    }

    const handleInput = props.debounce ? debounce(handleChange) : throttle(handleChange)

    return {
      props,
      nh,
      locale: useLocale('input'),
      idFor,
      focused,
      isHover,

      className,
      hasPrefix,
      hasSuffix,
      inputStyle,
      preciseNumber,
      formattedValue,
      plusDisabled,
      minusDisabled,
      hasValue,
      showClear,
      inputValue,
      isReadonly,
      controlFade,

      wrapper,
      input: inputControl,

      handleFocus,
      handleBlur,
      plusNumber,
      minusNumber,
      handleInput,
      handleChange,
      handleClear,
      handlePrefixClick,
      handleSuffixClick,
      handleKeyPress
    }
  }
})
</script>
