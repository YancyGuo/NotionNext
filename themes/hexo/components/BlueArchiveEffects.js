import { useEffect } from 'react'
import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import CONFIG from '../config'

const DEFAULT_SCRIPT =
  '/js/ba-click-fx.iife.js'
const MOBILE_EFFECT_QUERY =
  '(max-width: 767px), (max-width: 1024px) and (orientation: portrait)'

/**
 * 客户端加载 ba-click-fx 官方实现。
 * 特效几何、TrailRenderer 拖尾和粒子生命周期均由原项目负责。
 */
const BlueArchiveEffects = () => {
  const enabled = siteConfig('HEXO_BA_EFFECT_ENABLE', true, CONFIG)
  const color = siteConfig('HEXO_BA_EFFECT_COLOR', '#4ca7ff', CONFIG)
  const script = siteConfig('HEXO_BA_EFFECT_SCRIPT', DEFAULT_SCRIPT, CONFIG)

  useEffect(() => {
    const effectEnabled =
      enabled !== false &&
      enabled !== 0 &&
      enabled !== 'false' &&
      enabled !== '0'

    if (!effectEnabled || typeof window === 'undefined') {
      return undefined
    }

    let destroyed = false
    let effect
    const mobileQuery = window.matchMedia(MOBILE_EFFECT_QUERY)

    const updateTrailMode = () => {
      effect?.updateConfig({ trailEnabled: !mobileQuery.matches })
    }
    const addMobileQueryListener = () => {
      if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', updateTrailMode)
      } else {
        mobileQuery.addListener(updateTrailMode)
      }
    }
    const removeMobileQueryListener = () => {
      if (typeof mobileQuery.removeEventListener === 'function') {
        mobileQuery.removeEventListener('change', updateTrailMode)
      } else {
        mobileQuery.removeListener(updateTrailMode)
      }
    }

    const start = async () => {
      try {
        await loadExternalResource(script, 'js')
        if (destroyed || !window.BAClickFX?.BAClickFX) {
          return
        }

        effect = new window.BAClickFX.BAClickFX({
          themeColor: color,
          scale: 0.65,
          opacity: 1,
          effectBackend: 'webgl2',
          renderingMode: 'enhanced',
          bloomBackend: 'webgl2',
          clickEnabled: true,
          trailEnabled: !mobileQuery.matches,
          trailAlways: false,
          hostCompositing: 'source-over',
          maxDpr: 1
        })

        // 保留官方几何与拖尾质感，同时降低拖尾粒子密度和采样开销。
        effect.setFxParam('trail.minVertexDistance', 10)
        effect.setFxParam('trail.lifetimeMs', 220)
        effect.setFxParam('shards.trailSpacing', 160)
        effect.setFxParam('shards.maxCount', 20)

        // 保持官方点击圆盘与圆环的 Bloom 强度。
        effect.setFxParam('bloom.clickEmissionScale', 1)
        effect.setFxParam('bloom.diffusion', 5)

        addMobileQueryListener()
      } catch (error) {
        console.warn('[Hexo] ba-click-fx 加载失败', error)
      }
    }

    void start()

    return () => {
      destroyed = true
      removeMobileQueryListener()
      effect?.destroy()
    }
  }, [script, color, enabled])

  return null
}

export default BlueArchiveEffects
