// import Image from 'next/image'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { loadExternalResource } from '@/lib/utils'
import { useEffect, useState } from 'react'
import CONFIG from '../config'
import NavButtonGroup from './NavButtonGroup'

let wrapperTop = 0

/**
 * 顶部全屏大图
 * @returns
 */
const Hero = props => {
  const [typed, changeType] = useState()
  const [randomImageSrc, setRandomImageSrc] = useState(null)
  const [randomImageReady, setRandomImageReady] = useState(false)
  const { siteInfo } = props
  const { locale } = useGlobal()
  const randomImageApi = siteConfig(
    'HEXO_HOME_BANNER_RANDOM_IMAGE_API',
    '',
    CONFIG
  )
  const scrollToWrapper = () => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    window.scrollTo({ top: wrapperTop - 2 * rem, behavior: 'smooth' })
  }

  const GREETING_WORDS = siteConfig('GREETING_WORDS').split(',')
  const GREETING_WORDS_TYPE_SPEED = Number(siteConfig('GREETING_WORDS_TYPE_SPEED')) || 200
  const GREETING_WORDS_BACK_SPEED = Number(siteConfig('GREETING_WORDS_BACK_SPEED')) || 100
  useEffect(() => {
    updateHeaderHeight()

    if (!typed && window && document.getElementById('typed')) {
      loadExternalResource('/js/typed.min.js', 'js').then(() => {
        if (window.Typed) {
          changeType(
            new window.Typed('#typed', {
              strings: GREETING_WORDS,
              typeSpeed: GREETING_WORDS_TYPE_SPEED,
              backSpeed: GREETING_WORDS_BACK_SPEED,
              backDelay: 400,
              showCursor: true,
              smartBackspace: true
            })
          )
        }
      })
    }

    window.addEventListener('resize', updateHeaderHeight)
    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
    }
  })

  useEffect(() => {
    if (!randomImageApi || typeof window === 'undefined') return undefined

    const controller = new AbortController()
    let timeoutId

    const preloadRandomImage = async () => {
      try {
        // The API returns a direct /file/... URL, so only this small response
        // is fetched first. The image itself is decoded before becoming visible.
        timeoutId = window.setTimeout(() => controller.abort(), 8000)
        const response = await fetch(randomImageApi, {
          cache: 'no-store',
          signal: controller.signal
        })

        if (!response.ok)
          throw new Error(`Random image API: ${response.status}`)

        const responseBody = (await response.text()).trim()
        let rawUrl = responseBody
        try {
          const payload = JSON.parse(responseBody)
          rawUrl =
            typeof payload === 'string'
              ? payload
              : payload?.url || payload?.data?.url || ''
        } catch {
          // Some ImgBed versions return the direct URL as plain text.
        }
        rawUrl = rawUrl.trim()
        if (!rawUrl) throw new Error('Random image API returned no URL')

        const imageUrl = new URL(rawUrl, window.location.href)
        if (!['http:', 'https:'].includes(imageUrl.protocol)) {
          throw new Error('Random image URL must use HTTP(S)')
        }

        const image = new window.Image()
        image.decoding = 'async'
        await new Promise((resolve, reject) => {
          image.onload = resolve
          image.onerror = reject
          image.src = imageUrl.href
        })
        if (typeof image.decode === 'function') {
          await image.decode().catch(() => {})
        }

        if (!controller.signal.aborted) {
          setRandomImageSrc(imageUrl.href)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[HexoHero] 随机背景图加载失败，继续使用默认封面', error)
        }
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId)
      }
    }

    preloadRandomImage()

    return () => {
      controller.abort()
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [randomImageApi])

  useEffect(() => {
    if (!randomImageSrc) return undefined

    const frame = window.requestAnimationFrame(() => {
      setRandomImageReady(true)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [randomImageSrc])

  function updateHeaderHeight() {
    requestAnimationFrame(() => {
      const wrapperElement = document.getElementById('wrapper')
      wrapperTop = wrapperElement?.offsetTop
    })
  }

  return (
    <header
      id='header'
      style={{ zIndex: 1 }}
      className='w-full h-screen relative bg-black'>
      <div className='text-white absolute bottom-0 z-10 flex flex-col h-full items-center justify-center w-full '>
        {/* 站点标题 */}
        <div className='font-bold text-4xl md:text-5xl shadow-text'>
          {siteInfo?.title || siteConfig('TITLE')}
        </div>
        {/* 站点欢迎语 */}
        <div className='mt-2 h-12 items-center text-center font-light shadow-text text-lg'>
          <span id='typed' />
        </div>

        {/* 首页导航大按钮 */}
        {siteConfig('HEXO_HOME_NAV_BUTTONS', null, CONFIG) && (
          <NavButtonGroup {...props} />
        )}

        {/* 滚动按钮 */}
        <div
          onClick={scrollToWrapper}
          className='z-10 cursor-pointer w-full text-center py-4 text-3xl absolute bottom-10 text-white [text-shadow:0_0_0.1em_black,0_0_0.2em_black]'>
          <div className='opacity-70 animate-bounce text-xs'> 
            {siteConfig('HEXO_SHOW_START_READING', null, CONFIG) &&
              locale.COMMON.START_READING}
          </div>
          <i className='opacity-70 animate-bounce fas fa-angle-down' />
        </div>
      </div>

      <LazyImage
        priority
        id='header-cover'
        alt={siteInfo?.title}
        src={siteInfo?.pageCover}
        width={1920}
        height={1080}
        className={`header-cover absolute inset-0 w-full h-screen object-cover object-center ${siteConfig('HEXO_HOME_NAV_BACKGROUND_IMG_FIXED', null, CONFIG) ? 'fixed' : ''}`}
      />

      {randomImageSrc && (
        // The image is shown only after it has been preloaded and decoded.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          id='header-cover-random'
          src={randomImageSrc}
          alt={siteInfo?.title}
          width={1920}
          height={1080}
          aria-hidden='true'
          className={`header-cover-random absolute inset-0 w-full h-screen object-cover object-center ${siteConfig('HEXO_HOME_NAV_BACKGROUND_IMG_FIXED', null, CONFIG) ? 'fixed' : ''}${randomImageReady ? ' is-ready' : ''}`}
          decoding='async'
        />
      )}
    </header>
  )
}

export default Hero
