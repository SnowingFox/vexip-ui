<template>
  <Row ref="wrapper" tag="section" :class="prefix">
    <Column>
      <div :class="`${prefix}__example`">
        <NativeScroll
          mode="horizontal"
          width="100%"
          use-x-bar
          :scroll-style="{
            display: 'inline-block',
            padding: '20px 12px 8px'
          }"
        >
          <slot></slot>
        </NativeScroll>
      </div>
      <div :class="`${prefix}__description`">
        <slot name="desc"></slot>
      </div>
    </Column>
    <Column :class="`${prefix}__actions`">
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon :scale="1.1" @click="copyCodes">
              <CopyR></CopyR>
            </Icon>
          </button>
        </template>
        {{ t('common.copyCode') }}
      </Tooltip>
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon :scale="1.1" :label="t('common.editInGithub')" @click="editInGithub">
              <PenToSquareR></PenToSquareR>
            </Icon>
          </button>
        </template>
        {{ t('common.editInGithub') }}
      </Tooltip>
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon :scale="1.1" :label="t('common.editInPlayground')" @click="editOnPlayground">
              <PaperPlaneR></PaperPlaneR>
            </Icon>
          </button>
        </template>
        {{ t('common.editInPlayground') }}
      </Tooltip>
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon
              :scale="1.1"
              :label="codeExpanded ? t('common.hideCode') : t('common.showCode')"
              @click="expandCodes"
            >
              <Code></Code>
            </Icon>
          </button>
        </template>
        {{ codeExpanded ? t('common.hideCode') : t('common.showCode') }}
      </Tooltip>
    </Column>
    <CollapseTransition>
      <Column v-show="codeExpanded" :class="`${prefix}__code`">
        <div :class="`language-${lang}`">
          <pre :class="`language-${lang}`" :lang="lang"><code ref="codeRef"></code></pre>
          <span v-if="codeLines > 0" class="code-line-numbers">
            <span v-for="n in codeLines" :key="n"></span>
          </span>
        </div>
        <button :class="`${prefix}__reduce`" @click="expandCodes">
          <Icon><ChevronUp></ChevronUp></Icon>
          <span :class="`${prefix}__tip`">
            {{ t('common.hideCode') }}
          </span>
        </button>
      </Column>
    </CollapseTransition>
  </Row>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { Message } from 'vexip-ui'
import { CopyR, PenToSquareR, PaperPlaneR, Code, ChevronUp } from '@vexip-ui/icons'
import { useI18n } from 'vue-i18n'
import { highlight, languages } from 'prismjs'
import { transformDemoCode } from './demo-prefix'
import { usePlayground } from './playground'

import type { PropType } from 'vue'
import type { Row } from 'vexip-ui'

const extensionMap: Record<string, string> = {
  vue: 'markup',
  html: 'markup',
  md: 'markdown',
  rb: 'ruby',
  ts: 'typescript',
  py: 'python',
  sh: 'bash',
  yml: 'yaml',
  styl: 'stylus',
  kt: 'kotlin',
  rs: 'rust'
}

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  },
  lang: {
    type: String,
    default: 'vue'
  },
  lines: {
    type: Number,
    default: 0
  },
  github: {
    type: String,
    default: ''
  },
  onMounted: {
    type: Function as PropType<() => any>,
    default: null
  }
})

const { t } = useI18n({ useScope: 'global' })

const prefix = 'demo'
const codeExpanded = ref(false)
const codeLines = ref(props.lines)

const wrapper = ref<InstanceType<typeof Row>>()
const codeRef = ref<HTMLElement>()

watchEffect(() => {
  if (!codeRef.value || !props.code) return

  const code = transformDemoCode(props.code)
  const lang = getCodeLang(props.lang.toLowerCase())

  if (languages[lang]) {
    codeLines.value = code.split('\n').length - 1
    codeRef.value.innerHTML = highlight(code, languages[lang], lang)
  }
})

onMounted(() => {
  if (typeof props.onMounted === 'function') {
    props.onMounted()
  }
})

function expandCodes() {
  codeExpanded.value = !codeExpanded.value
}

function copyCodes() {
  let isSuccess = false

  if (wrapper.value?.$el) {
    const code = wrapper.value.$el.querySelector('pre code')
    const textarea = document.createElement('textarea')

    textarea.style.height = '0'
    textarea.setAttribute('readonly', 'readonly')

    textarea.value = code?.textContent ?? ''

    document.body.appendChild(textarea)
    textarea.select()

    isSuccess = document.execCommand('copy')

    document.body.removeChild(textarea)
  }

  if (isSuccess) {
    Message.success(t('common.copySuccess'))
  } else {
    Message.error(t('common.copyFail'))
  }
}

function getCodeLang(extension: string) {
  return extensionMap[extension] ?? extension
}

const githubBaseUrl = 'https://github.com/vexip-ui/vexip-ui/blob/main/docs/'

function editInGithub() {
  if (props.github) {
    window.open(`${githubBaseUrl}${props.github}`)
  }
}

function editOnPlayground() {
  // should use the original code
  if (props.code) {
    const { link } = usePlayground(props.code)

    window.open(link)
  }
}
</script>

<style lang="scss">
@use '../style/mixins.scss' as *;

.demo {
  margin-bottom: 1.4em;
  border: var(--vxp-border-light-2);
  border-radius: var(--vxp-radius-base);
  transition: var(--vxp-transition-border), var(--vxp-transition-shadow);

  &:hover {
    box-shadow: var(--vxp-shadow-base);
  }

  &:target {
    border-color: var(--vxp-color-primary-opacity-2);
  }

  &__example {
    padding: 20px 12px 8px;
  }

  &__description {
    padding: 0 14px 14px;

    .markdown p {
      padding: 0 14px;
      margin-bottom: 6px;
    }

    .anchor {
      width: 100%;
      margin: 14px 0;
      font-size: var(--vxp-font-size-primary);
      color: var(--vxp-content-color-base);
      white-space: nowrap;

      &::before,
      &::after {
        position: relative;
        top: 50%;
        content: '';
        border-top: var(--vxp-border-light-2);
        transition: var(--vxp-transition-border);
        transform: translateY(50%);
      }

      &::before {
        width: 14px;
        margin-right: 8px;
      }

      &::after {
        width: calc(100% - 14px);
        margin-left: 8px;
      }

      &__link {
        display: none;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    border-top: var(--vxp-border-light-2);
    transition: var(--vxp-transition-border);
  }

  &__action {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 3px;
    color: var(--vxp-content-color-placeholder);
    cursor: pointer;
    background-color: transparent;
    border: 0;
    outline: 0;
    transition: var(--vxp-transition-color);

    &:hover,
    &:focus {
      color: var(--vxp-color-primary-opacity-2);
    }

    &:first-child {
      margin-left: 0;
    }

    .vxp-tooltip__trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    .vxp-tooltip__tip {
      white-space: nowrap;
    }

    .vxp-icon {
      width: 100%;
      height: 100%;
    }
  }

  &__actions:hover &__action,
  &__actions:focus-within &__action {
    color: var(--vxp-content-color-third);

    &:hover,
    &:focus {
      color: var(--vxp-color-primary-opacity-2);
    }
  }

  &__code {
    overflow: hidden;
    border-top: var(--vxp-border-light-2);
    border-radius: 0 0 var(--vxp-border-radius-base) var(--vxp-border-radius-base);
  }

  &__reduce {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 32px;
    padding: 6px 0;
    color: var(--vxp-content-color-placeholder);
    cursor: pointer;
    background-color: transparent;
    border: 0;
    border-top: var(--vxp-border-light-2);
    outline: 0;

    &:hover,
    &:focus {
      color: var(--vxp-color-primary-opacity-2);
    }
  }

  &__reduce &__tip {
    width: 80px;
    padding-left: 10px;
    margin-right: -80px;
    white-space: nowrap;
    opacity: 0%;
    transition:
      margin var(--vxp-transition-base),
      var(--vxp-transition-color),
      var(--vxp-transition-opacity);
  }

  &__reduce:hover &__tip,
  &__reduce:focus &__tip {
    margin-right: 0;
    opacity: 100%;
  }

  div[class*='language-'] {
    border-radius: 0;
  }
}
</style>
