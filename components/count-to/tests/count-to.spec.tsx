import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { CountTo } from '..'
vi.useFakeTimers()

describe('CountTo', () => {
  it('render', () => {
    const wrapper = mount(CountTo)

    expect(wrapper.classes()).toContain('vxp-count-to-vars')
    expect(wrapper.find('span').text()).toEqual('0')
  })

  it('should autoplay when mounted', async () => {
    const wrapper = mount(() => <CountTo start={0} end={100} duration={1000} appear={true} />)
  })
})
