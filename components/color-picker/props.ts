import {
  buildProps,
  booleanProp,
  booleanStringProp,
  sizeProp,
  stateProp,
  eventProp
} from '@vexip-ui/config'

import type { PropType, ExtractPropTypes } from 'vue'
import type { ConfigurableProps } from '@vexip-ui/config'
import type { Placement } from '@vexip-ui/hooks'
import type { Color, HSVAColor, RGBAColor, HSLAColor } from '@vexip-ui/utils'
import type { ColorFormat } from './symbol'

type FormattedColor = string | RGBAColor | HSLAColor | HSVAColor

export const colorPickerProps = buildProps({
  size: sizeProp,
  state: stateProp,
  value: [String, Object] as PropType<Color | null>,
  visible: booleanProp,
  format: String as PropType<ColorFormat>,
  alpha: booleanProp,
  disabled: booleanProp,
  transitionName: String,
  noInput: booleanProp,
  shortcut: {
    type: [Boolean, Array] as PropType<boolean | string[]>,
    default: null
  },
  placement: String as PropType<Placement>,
  transfer: booleanStringProp,
  outsideClose: booleanProp,
  clearable: booleanProp,
  cancelText: String,
  confirmText: String,
  prefix: Object,
  prefixColor: String,
  suffix: Object,
  suffixColor: String,
  noSuffix: booleanProp,
  staticSuffix: booleanProp,
  loading: booleanProp,
  loadingIcon: Object,
  loadingLock: booleanProp,
  loadingSpin: booleanProp,
  onToggle: eventProp<(visible: boolean) => void>(),
  onClickOutside: eventProp(),
  onOutsideClose: eventProp(),
  onClear: eventProp(),
  onChange: eventProp<(color: FormattedColor) => void>(),
  onShortcut: eventProp<(color: FormattedColor) => void>()
})

export type ColorPickerProps = ExtractPropTypes<typeof colorPickerProps>
export type ColorPickerCProps = ConfigurableProps<ColorPickerProps>
