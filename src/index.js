import './styles.css'
import barba from '@barba/core'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

import PlaneBaseNew from './PlaneBaseNew.js'
import PlaneStatic from './PlaneStatic.js'
import PlaneHover from './PlaneHover.js'
import Stage from './Stage.js'

import { debounce } from 'lodash'

import { index } from './views/index.js'
import { project } from './views/project.js'

// import { transition } from './transition.js'
import * as transition from './transition.js'
import { restartWebflow } from '@finsweet/ts-utils'

import HomePageAnimation from './animation/HomePageAnimation.js'
import ProjectPageAnimation from './animation/ProjectPageAnimation.js'
import { doc } from 'prettier'

import { RevealWords } from './RevealWords.js'

gsap.registerPlugin(ScrollTrigger)

class App {
  lenis
  plane
  DOM = {
    container: document.querySelector('.canvas-container'),
    itemsWrapper: document.querySelector('.projects_list'),
    home: {
      el: document.querySelector('.projects_list'),
    },
    project: {
      el: document.querySelector('.project_cover'),
    },
    mouse: {
      cursor1: document.querySelector('.cursor-inner'),
      cursor2: document.querySelector('.cursor-outer'),
    },
  }

  constructor() {
    this.scrollThreshold = 5
    this.mouse = {
      x: 0,
      y: 0,
    }

    this.isFirstLoad = true
    this.init()
    // this.isFirstLoad = false
  }

  init() {
    this.createStage()
    this.createLenis()
    this.preventReloading()
    this.createEventListeners()
    this.animateCursor(this.DOM.mouse.cursor1, 0.2)
    this.animateCursor(this.DOM.mouse.cursor2, 0.1)

    const container = document.querySelector('main')

    this.homePageAnimation = new HomePageAnimation(container)
    this.projectPageAnimation = new ProjectPageAnimation()

    barba.init({
      views: [index, project],
      // transitions: [transition.homeToProject, transition.projectToHome],
      transitions: [transition.transitionHome, transition.transitionProject],
    })

    barba.hooks.afterOnce(() => {
      this.isFirstLoad = false
      console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbb')
    })

    barba.hooks.beforeEnter(async () => {
      // console.log('Restarting webflow')
      // await restartWebflow()
    })

    barba.hooks.afterEnter(() => {
      // if (this.lenis) {
      //   this.lenis.destroy()
      // }
      // this.createLenis()
    })
  }

  createStage() {
    const container = document.querySelector('.canvas-container')

    // Init three.js
    this.stage = new Stage(container)
  }

  createLenis() {
    this.lenis = new Lenis({
      duration: 2.5,
      normalizeWheel: true,
    })

    this.lenis.on('scroll', ({ scroll }) => {
      // update our scroll manager values
      this.stage.updateScrollValues(scroll)

      if (this.stage.sphere) {
        this.stage.animateSphere(0, scroll)
      }
    })

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000)
    })

    console.log('Lenis: ', this.lenis)
  }

  animateCursor(cursor, speed = 0.1) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50 })

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    this.mouse = { x: pos.x, y: pos.y }

    const fpms = 60 / 1000

    const xSet = gsap.quickSetter(cursor, 'x', 'px')
    const ySet = gsap.quickSetter(cursor, 'y', 'px')

    gsap.ticker.add((time, deltaTime) => {
      const delta = deltaTime * fpms
      const dt = 1.0 - Math.pow(1.0 - speed, delta)

      pos.x += (this.mouse.x - pos.x) * dt
      pos.y += (this.mouse.y - pos.y) * dt
      xSet(pos.x)
      ySet(pos.y)
    })
  }

  onMouseMove(event) {
    this.mouse.x = event.x
    this.mouse.y = event.y
  }

  preventReloading() {
    // Prevent reloading the same page
    const links = document.querySelectorAll('a[href]')
    const cbk = (e) => {
      if (e.currentTarget.href === window.location.href) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    for (let i = 0; i < links.length; i++) {
      links[i].addEventListener('click', cbk)
    }
  }

  createEventListeners() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }

  // Getter methods for document and window properties
  get documentHeight() {
    return document.documentElement.scrollHeight
  }

  get viewportHeight() {
    return window.innerHeight
  }

  get scrollPosition() {
    return window.scrollY
  }
}

window.Webflow ||= []
window.Webflow.push(() => {
  // console.clear()

  if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    console.log(`DOM hasn't loaded`)
  } else {
    // `DOMContentLoaded` has already fired
    console.log(`DOM has loaded`)
    window.APP = new App('#app', {
      debug: window.location.hash.includes('debug'),
    })
  }
})
