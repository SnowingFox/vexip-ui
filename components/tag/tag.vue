<template>
  <div :class="className" :style="style">
    <span>
      <slot></slot>
    </span>
    <button v-if="props.closable" :class="nh.be('close')" @click.left.stop="handleClose">
      <Icon label="close">
        <Xmark></Xmark>
      </Icon>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { Icon } from '@/components/icon'
import { useNameHelper, useProps, createSizeProp, emitEvent } from '@vexip-ui/config'
import { Xmark } from '@vexip-ui/icons'
import { parseColorToRgba, adjustAlpha } from '@vexip-ui/utils'
import { tagProps } from './props'

import type { TagType } from './symbol'

const tagTypes = Object.freeze<TagType>([
  'default',
  'primary',
  'info',
  'success',
  'error',
  'warning',
  'lime',
  'pink',
  'magenta',
  'tomato',
  'orange',
  'cyan',
  'navy',
  'gold',
  'purple'
])

export default defineComponent({
  name: 'Tag',
  components: {
    Icon,
    Xmark
  },
  props: tagProps,
  emits: [],
  setup(_props) {
    const props = useProps('tag', _props, {
      size: createSizeProp(),
      type: {
        default: 'default',
        validator: (value: TagType) => tagTypes.includes(value)
      },
      border: false,
      closable: false,
      simple: false,
      circle: false
    })

    const nh = useNameHelper('tag')

    const className = computed(() => {
      return {
        [nh.b()]: true,
        [nh.bs('vars')]: true,
        [nh.bm('inherit')]: props.inherit,
        [nh.bm(props.size)]: props.size !== 'default',
        [nh.bm(props.type)]: props.type !== 'default',
        [nh.bm('border')]: props.border,
        [nh.bm('simple')]: props.simple,
        [nh.bm('circle')]: props.circle
      }
    })
    const style = computed(() => {
      if (props.color) {
        const baseColor = parseColorToRgba(props.color)
        const base = baseColor.toString()

        return nh.cvm({
          color: 'var(--vxp-color-white)',
          'bg-color': base,
          'b-color': base,
          'close-color': 'var(--vxp-color-white)',
          ...(props.simple || props.border
            ? {
                color: base,
                'close-color': base
              }
            : {}),
          ...(props.simple
            ? {
                'bg-color': adjustAlpha(baseColor, 0.2).toString()
              }
            : {})
        })
      }

      return {}
    })

    function handleClose() {
      if (props.closable) {
        emitEvent(props.onClose)
      }
    }

    return {
      props,
      nh,

      className,
      style,

      handleClose
    }
  }
})
</script>
