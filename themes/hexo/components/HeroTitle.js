import { useEffect, useRef } from 'react'

const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 250
const FONT_SIZE = 84
const FONT_FAMILY = '"RoGSanSrfStd-Bd"'
const CANVAS_FONT = `${FONT_SIZE}px ${FONT_FAMILY}, Arial, sans-serif`
const WORD_GAP = 14
const HORIZONTAL_TILT = -0.4
const GRAPH_OFFSET = { X: -15, Y: 0 }
const HALO_PATH = '/images/hero/bluearchive/halo.png'
const CROSS_PATH = '/images/hero/bluearchive/cross.png'
const HOLLOW_PATH = [
  [284, 136],
  [321, 153],
  [159, 410],
  [148, 403]
]

const splitTitle = title => {
  const safeTitle = (title || '').trim()
  const words = safeTitle.split(/\s+/).filter(Boolean)

  if (words.length < 2) {
    return { leftText: safeTitle, rightText: '' }
  }

  return {
    leftText: words.slice(0, -1).join(' '),
    rightText: words[words.length - 1]
  }
}

const loadImage = src =>
  new Promise(resolve => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })

const HeroTitle = ({ title }) => {
  const canvasRef = useRef(null)
  const safeTitle = (title || '').trim()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    let cancelled = false
    const { leftText, rightText } = splitTitle(title)
    const baseline = CANVAS_HEIGHT * 0.68

    const drawLogo = (halo, cross) => {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      context.font = CANVAS_FONT

      const leftMetrics = context.measureText(leftText)
      const rightMetrics = context.measureText(rightText)
      const leftDescent = leftMetrics.fontBoundingBoxDescent || FONT_SIZE * 0.2
      const rightAscent = rightMetrics.fontBoundingBoxAscent || FONT_SIZE * 0.8
      const leftWidth =
        leftMetrics.width - (baseline + leftDescent) * HORIZONTAL_TILT
      const rightWidth =
        rightMetrics.width + (baseline - rightAscent) * HORIZONTAL_TILT
      const contentWidth = leftWidth + WORD_GAP + rightWidth
      const contentOffset = (CANVAS_WIDTH - contentWidth) / 2
      const leftAnchor = contentOffset + leftWidth
      const rightAnchor = leftAnchor + WORD_GAP
      const graphX = leftAnchor - CANVAS_HEIGHT / 2 + GRAPH_OFFSET.X

      context.fillStyle = '#128AFA'
      context.textAlign = 'end'
      context.setTransform(1, 0, HORIZONTAL_TILT, 1, 0, 0)
      context.fillText(leftText, leftAnchor, baseline)
      context.resetTransform()

      if (halo) {
        context.save()
        // The source Halo is dark for a white logo canvas; invert it for the dark Hero.
        context.filter = 'brightness(0) invert(1)'
        context.drawImage(
          halo,
          graphX,
          GRAPH_OFFSET.Y,
          CANVAS_HEIGHT,
          CANVAS_HEIGHT
        )
        context.restore()
      }

      if (rightText) {
        context.fillStyle = '#2B2B2B'
        context.textAlign = 'start'
        context.setTransform(1, 0, HORIZONTAL_TILT, 1, 0, 0)
        context.fillText(rightText, rightAnchor, baseline)
        context.resetTransform()
      }

      if (cross) {
        context.beginPath()
        context.moveTo(
          graphX + (HOLLOW_PATH[0][0] / 500) * CANVAS_HEIGHT,
          GRAPH_OFFSET.Y + (HOLLOW_PATH[0][1] / 500) * CANVAS_HEIGHT
        )
        for (let index = 1; index < HOLLOW_PATH.length; index += 1) {
          context.lineTo(
            graphX + (HOLLOW_PATH[index][0] / 500) * CANVAS_HEIGHT,
            GRAPH_OFFSET.Y + (HOLLOW_PATH[index][1] / 500) * CANVAS_HEIGHT
          )
        }
        context.closePath()
        context.save()
        context.globalCompositeOperation = 'destination-out'
        context.fill()
        context.restore()
        context.drawImage(
          cross,
          graphX,
          GRAPH_OFFSET.Y,
          CANVAS_HEIGHT,
          CANVAS_HEIGHT
        )
      }
    }

    const fontReady = document.fonts?.load
      ? document.fonts.load(CANVAS_FONT, `${leftText} ${rightText}`)
      : Promise.resolve()

    drawLogo(null, null)
    Promise.all([fontReady, loadImage(HALO_PATH), loadImage(CROSS_PATH)])
      .then(([, halo, cross]) => {
        if (!cancelled) drawLogo(halo, cross)
      })
      .catch(() => {
        if (!cancelled) drawLogo(null, null)
      })

    return () => {
      cancelled = true
    }
  }, [title])

  return (
    <div className='hero-brand' aria-label={safeTitle}>
      <canvas
        ref={canvasRef}
        className='hero-brand__canvas'
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        aria-label={safeTitle}
      />
    </div>
  )
}

export default HeroTitle
