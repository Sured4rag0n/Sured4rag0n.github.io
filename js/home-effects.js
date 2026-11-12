/* Homepage dynamic background & colorful title */
(function () {
  'use strict'

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var rafId = 0
  var orientHandler = null

  function cancelLoop () {
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  function initBackground () {
    cancelLoop()

    var header = document.querySelector('#page-header.full_page')
    if (!header) return

    header.classList.remove('home-parallax')
    header.style.backgroundPosition = ''

    if (reduceMotion) return

    var bg = header.style.backgroundImage
    if (!bg || bg === 'none') return

    header.classList.add('home-parallax')

    var targetX = 0
    var targetY = 0
    var currentX = 0
    var currentY = 0
    var tick = 0
    var isTouch = window.matchMedia('(hover: none)').matches

    function onPointerMove (e) {
      var rect = header.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * -24
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -18
    }

    function onPointerLeave () {
      targetX = 0
      targetY = 0
    }

    if (header.__homePointerMove) header.removeEventListener('pointermove', header.__homePointerMove)
    if (header.__homePointerLeave) header.removeEventListener('pointerleave', header.__homePointerLeave)

    header.__homePointerMove = onPointerMove
    header.__homePointerLeave = onPointerLeave
    header.addEventListener('pointermove', onPointerMove, { passive: true })
    header.addEventListener('pointerleave', onPointerLeave)

    if (orientHandler) window.removeEventListener('deviceorientation', orientHandler)
    orientHandler = function (e) {
      if (e.gamma == null || e.beta == null) return
      targetX = Math.max(-20, Math.min(20, e.gamma * 0.7))
      targetY = Math.max(-16, Math.min(16, (e.beta - 45) * 0.5))
    }
    window.addEventListener('deviceorientation', orientHandler, { passive: true })

    function loop () {
      tick += 0.008

      if (isTouch) {
        targetX = Math.sin(tick) * 14
        targetY = Math.cos(tick * 0.8) * 10
      }

      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08

      header.style.backgroundPosition = 'calc(50% + ' + currentX.toFixed(2) + 'px) calc(50% + ' + currentY.toFixed(2) + 'px)'
      rafId = window.requestAnimationFrame(loop)
    }

    loop()
  }

  function initTitle () {
    var title = document.querySelector('#page-header.full_page #site-title')
    if (!title || title.dataset.homeTitle === '1') return

    var text = title.textContent
    if (!text || !text.trim()) return

    title.dataset.homeTitle = '1'
    title.classList.add('home-title')

    var fragment = document.createDocumentFragment()
    for (var i = 0; i < text.length; i++) {
      var ch = text[i]
      if (ch === ' ') {
        fragment.appendChild(document.createTextNode(' '))
        continue
      }
      var span = document.createElement('span')
      span.className = 'home-char'
      span.style.setProperty('--i', i)
      span.style.color = 'hsl(' + ((i * 36) % 360) + ', 90%, 68%)'
      span.textContent = ch
      fragment.appendChild(span)
    }

    title.textContent = ''
    title.appendChild(fragment)
  }

  function init () {
    initBackground()
    initTitle()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  document.addEventListener('pjax:complete', function () {
    window.setTimeout(init, 60)
  })
})()
