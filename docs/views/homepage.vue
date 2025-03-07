<template>
  <section :class="prefix" :style="{ '--wave-top': `${waveTop}px` }">
    <NativeScroll use-y-bar @resize="handleResize">
      <div :class="`${prefix}__wave`">
        <div :class="`${prefix}__wave-block`"></div>
        <Wave ref="wave"></Wave>
      </div>
      <div ref="sign" :class="`${prefix}__sign`">
        <img :class="`${prefix}__logo`" src="/vexip-ui.svg" alt="vexip-ui" />
        <h1 :class="`${prefix}__title`">
          Vexip UI
        </h1>
        <p :class="`${prefix}__description`">
          {{ t('common.slogan') }}
        </p>
        <div :class="`${prefix}__actions`">
          <Button type="primary" size="large" @click="getStarted">
            {{ t('common.getStarted') }}
          </Button>
          <Button size="large" @click="getComponents">
            {{ t('common.getComponents') }}
          </Button>
        </div>
      </div>
      <P style="margin: 0 0 16px; font-size: 15px;">
        {{ t('common.changePrefix') }}
      </P>
      <Input v-model:value="demoPrefix" :class="`${prefix}__prefix`" placeholder="e.g. Vxp">
        <template #after-action>
          <Button type="primary" @click="handleSvaePrefix">
            {{ t('common.apply') }}
          </Button>
        </template>
      </Input>
      <MajorColor
        :class="`${prefix}__colors`"
        :language="language"
        @change="refreshWave"
      ></MajorColor>
    </NativeScroll>
    <Linker v-if="language === 'zh-CN'" class="cn-record" to="https://beian.miit.gov.cn/">
      粤ICP备2020125887号-1
    </Linker>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { Message } from 'vexip-ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MajorColor from '../common/major-color.vue'
import Wave from '../common/wave.vue'
import { getDemoPrefix, setDemoPrefix } from '../common/demo-prefix'

const globalState = inject('globalState', { language: __ROLLBACK_LANG__ })

const prefix = 'homepage'
const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const language = computed(() => globalState.language)

const wave = ref<InstanceType<typeof Wave>>()
const sign = ref<HTMLElement>()

const waveTop = ref(494)

const demoPrefix = ref(getDemoPrefix())

function getStarted() {
  router.push(`/${globalState.language}/guides/setup`)
}

function getComponents() {
  router.push(`/${globalState.language}/components`)
}

function refreshWave() {
  wave.value?.refresh()
}

function handleResize() {
  if (!sign.value) return

  waveTop.value = Math.round(sign.value.getBoundingClientRect().height * 0.93)
}

function handleSvaePrefix() {
  setDemoPrefix(demoPrefix.value)
  Message.success(t('common.prefixChanged'))
}
</script>

<style lang="scss">
.homepage {
  --wave-top: 494px;

  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: var(--header-height);
  text-align: center;
  user-select: none;

  &__wave {
    position: absolute;
    top: 0;
    z-index: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: none;

    &-block {
      height: var(--wave-top);
      background-image: linear-gradient(to bottom, transparent, var(--vxp-color-primary-opacity-8));
    }

    .wave {
      position: relative;
    }
  }

  &__sign {
    position: relative;
    margin-bottom: 100px;
  }

  &__logo {
    width: 30%;
    min-width: 90px;
    max-width: 210px;
    margin-top: 50px;
  }

  &__title {
    margin: 1rem 0;
    font-size: 3rem;
    font-weight: 400;
  }

  &__description {
    margin-bottom: 1rem;
    font-size: 1.4rem;
    font-weight: 300;
    line-height: 1.2;
    color: var(--vxp-content-color-base);
    text-align: center;
  }

  &__actions {
    padding: 2rem 0;

    .vxp-button {
      width: 8rem;
      font-size: 1rem;
    }
  }

  &__record {
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-size: var(--vxp-font-size-secondary);
    font-weight: 300;
    color: var(--vxp-content-color-placeholder);
    text-decoration: none;
    user-select: none;
  }

  &__prefix {
    max-width: 200px;
    margin-bottom: 20px;

    .vxp-input__control {
      width: 100%;
    }
  }

  &__colors {
    position: relative;
    width: 100%;
  }

  .cn-record {
    position: absolute;
    right: 15px;
    bottom: 10px;
    color: var(--vxp-content-color-placeholder);
  }
}
</style>
