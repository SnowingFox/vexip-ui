import { describe, it, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { FullScreen } from '..'

describe('FullScreen', () => {
  it('should keep exited state when init', () => {
    const wrapper = mount(() => <FullScreen></FullScreen>)

    expect(wrapper.find('div').classes()).toMatchInlineSnapshot(`
      [
        "vxp-full-screen",
        "vxp-full-screen-vars",
      ]
    `)
    expect(wrapper.find('div').classes()).toStrictEqual(['vxp-full-screen', 'vxp-full-screen-vars'])
  })

  it('should work', async () => {
    const wrapper = mount(() => (
      <FullScreen>
        {{
          default: ({ enter, exit }: any) => {
            return (
              <>
                <button className={'enter'} onClick={() => enter()}></button>
                <button className={'exit'} onClick={() => exit()}></button>
              </>
            )
          }
        }}
      </FullScreen>
    ))

    await wrapper.find('.enter').trigger('click')
    expect(document.body.firstElementChild!.className).toContain('vxp-full-screen--full')
    await (document.querySelector('.exit')! as HTMLButtonElement).click()

    expect(wrapper.find('div').classes()).not.toContain('vxp-full-screen--full')
  })

  it('should work via exposed methods', async () => {
    const wrapper = mount(() => <FullScreen></FullScreen>)

    const { enter, exit } = wrapper.findComponent(FullScreen).vm

    await enter()
    expect(wrapper.find('div').classes()).toContain('vxp-full-screen--full')
    await exit()
    expect(wrapper.find('div').classes()).not.toContain('vxp-full-screen--full')

    await enter('browser')
    expect(document.body.firstElementChild?.className).toContain('vxp-full-screen--full')
    await exit()
    expect(wrapper.find('div').classes()).not.toContain('vxp-full-screen--full')
  })

  it('should work via toggle', async () => {
    const wrapper = mount(() => <FullScreen></FullScreen>)

    const { toggle } = wrapper.findComponent(FullScreen).vm

    await toggle()
    expect(wrapper.find('div').classes()).toContain('vxp-full-screen--full')
    await toggle()
    expect(wrapper.classes()).not.toContain('vxp-full-screen--full')
  })

  test('zIndex should valid', async () => {
    const wrapper = mount(() => <FullScreen></FullScreen>)

    const { enter } = wrapper.findComponent(FullScreen).vm

    expect(wrapper.find('div').attributes().style).eq(undefined)
    await enter('window', 1)
    expect(wrapper.find('div').attributes().style).toContain('--vxp-full-screen-z-index: 1;')
  })

  test('should switch to another enterted state when current state is enterted.', async () => {
    const wrapper = mount(() => <FullScreen></FullScreen>)

    const { toggle } = wrapper.findComponent(FullScreen).vm

    await toggle()
    expect(wrapper.find('div').classes()).toContain('vxp-full-screen--full')
    await toggle('browser')
    expect(document.body.firstElementChild!.className).toContain('vxp-full-screen--full')
  })
})
