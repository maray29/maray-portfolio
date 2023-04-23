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
    this.init()

    this.pageScrolledToEnd = false
    this.scrollThreshold = 5

    this.mouse = {
      x: 0,
      y: 0,
    }

    // this.createEventListeners()
    // this.animateCursor(this.DOM.mouse.cursor1, 0.2)
    // this.animateCursor(this.DOM.mouse.cursor2, 0.1)
    // this.homeAnimations()
  }

  init() {
    this.createEventListeners()
    this.animateCursor(this.DOM.mouse.cursor1, 0.2)
    this.animateCursor(this.DOM.mouse.cursor2, 0.1)

    this.homePageAnimation = new HomePageAnimation()
    this.projectPageAnimation = new ProjectPageAnimation()

    barba.init({
      views: [index, project],
      transitions: [transition.homeToProject, transition.projectToHome],
    })

    barba.hooks.beforeEnter(async () => {
      await restartWebflow()
    })

    barba.hooks.afterEnter(() => {
      this.createLenis()
    })

    this.createLenis()

    const currentPage = window.location.pathname
    if (currentPage === '/') {
      this.homePageAnimation.initAnimations()
    } else if (currentPage.startsWith('/project')) {
      this.projectPageAnimation.initAnimations()
    }
    let htmlElement

    switch (currentPage) {
      case '/':
        htmlElement = this.DOM.home.el
        break
      case '/project-1':
        htmlElement = this.DOM.project.el
        break
      case '/project-2':
        htmlElement = this.DOM.project.el
        break
      // Add more cases for other pages
      default:
        throw new Error('Invalid page')
    }

    // htmlElement = this.DOM.home.el

    // Init three.js
    this.stage = new Stage(this.DOM.container)
    // this.plane = new PlaneStatic(htmlElement, this.stage, {
    //   strength: 0.35,
    // })

    // console.log(this.program.items[0].texture)

    // this.program.uniforms.uAlpha.value = 1
    // this.program.uniforms.uTexture.value = this.program.items[0].texture

    // console.log('this.program:', this.program.plane)
    // console.log('this.plane.position:', this.program.plane.position)
    // console.log('DOM:', this.DOM.project.el)
  }

  createLenis() {
    this.lenis = new Lenis({
      duration: 2.5,
      normalizeWheel: true,
    })

    this.lenis.on('scroll', ({ scroll }) => {
      // update our scroll manager values
      if (!this.plane) return
      this.plane.updateScrollValues(0, scroll)
      this.plane.scrollY = scroll

      this.plane.pageScrolledToEnd = this.isPageScrolledToEnd()

      // if (this.pageScrolledToEnd) {
      // console.log('The page is scrolled to the end.')
      // this.program.pageScrolledToEnd = true
      // } else {
      // console.log('The page is not scrolled to the end.')
      // this.program.pageScrolledToEnd = false
      // }
    })

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000)
    })
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

  isPageScrolledToEnd() {
    const distanceFromBottom = this.documentHeight - (this.scrollPosition + this.viewportHeight)
    return distanceFromBottom <= this.scrollThreshold
  }

  homeAnimations() {
    const headerTl = gsap.timeline()

    headerTl.to('.page-wrapper', { autoAlpha: 1 })
    // headerTl.set('.page-wrapper', { visibility: 'visible' })

    const logo = document.querySelector('.logo_wrap')
    const navContact = document.querySelector('.nav_contact')
    const navContactSubtitle = document.querySelector('.nav_contact-subtitle')

    const logoText = new SplitType(logo, { types: `chars` })

    function nestLettersDivs(text) {
      text.chars.forEach((el) => {
        const wrapper = document.createElement('div')
        wrapper.classList.add('char-mask')

        // insert wrapper before el in the DOM tree
        el.parentNode.insertBefore(wrapper, el)
        // move el into wrapper
        wrapper.appendChild(el)
      })
    }

    nestLettersDivs(logoText)

    headerTl.from(logoText.chars, {
      xPercent: -120,
      stagger: 0.015,
      duration: 1.0,
      ease: 'power.out4',
      autoAlpha: 0,
    })

    headerTl.from(navContact, {
      ease: 'power.out4',
      autoAlpha: 0,
    })

    headerTl.from(navContactSubtitle, {
      ease: 'power.out4',
      autoAlpha: 0,
    })

    // Section heading animation
    const sectionHeadingWraps = [...document.querySelectorAll('.section-heading_wrap')]

    sectionHeadingWraps.forEach((wrap) => {
      const headingBg = wrap.querySelector('.section-heading_bg')
      // const heading = wrap.querySelector('h2');

      gsap.from(headingBg, {
        height: 0,
        duration: 0.75,
        delay: 0.25,
        scrollTrigger: {
          trigger: wrap,
          start: 'top 60%',
          once: true,
        },
      })
    })

    // Project headings animation
    const projectHeadingWraps = [...document.querySelectorAll('.project_heading-wrapper')]
    const projectHeadings = [...document.querySelectorAll('.project_heading')]
    const projectHeadingBgs = [...document.querySelectorAll('.project_heading-bg')]
    const projectNumbers = [...document.querySelectorAll('.project_number')]

    gsap.from(projectHeadings, {
      // yPercent: 120,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.35,
      scrollTrigger: {
        trigger: projectHeadings,
        start: 'top 80%',
        once: true,
      },
    })

    gsap.from(projectNumbers, {
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.35,
      scrollTrigger: {
        trigger: projectHeadings,
        start: 'top 80%',
        once: true,
      },
    })

    gsap.from(projectHeadingBgs, {
      height: 0,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.15,
      scrollTrigger: {
        trigger: projectHeadingBgs,
        start: 'top 80%',
        once: true,
      },
    })

    const paragraphs = [...document.querySelectorAll('[data-animation="paragraph"]')]

    // paragraphs
    paragraphs.forEach((paragraph) => {
      const splitText = new SplitType(paragraph, {
        types: `lines`,
      })

      gsap.from(splitText.lines, {
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: 'power.out4',
        delay: 0.5,
        scrollTrigger: {
          trigger: paragraph,
          start: 'top 90%',
          once: true,
        },
      })
    })

    const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]

    ScrollTrigger.batch(fadeInElements, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.set(batch, {
          autoAlpha: 0,
        })
        gsap.to(batch, {
          autoAlpha: 1,
          stagger: 0.2,
          // delay: 0.4,
        })
      },
    })

    const processText = [...document.querySelectorAll('[data-animation="words"]')]
    const splitProcessText = new SplitType(processText, {
      types: `lines`,
    })
    splitProcessText.lines.forEach((line) => {
      const splitLines = new SplitType(line, { types: `words` })
      gsap.set(splitLines.words, {
        autoAlpha: 0.1,
      })
      gsap.to(splitLines.words, {
        autoAlpha: 1,
        stagger: 0.15,
        duration: 0.75,
        ease: 'power.out4',
        delay: 0.25,
        scrollTrigger: {
          trigger: line,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
          // once: true,
        },
      })
    })
  }
}

window.Webflow ||= []
window.Webflow.push(() => {
  console.clear()
  window.APP = new App()

  // Fetch the svg from github and append to the embed div
  // const progressDiagramLink =
  //   'https://gist.githubusercontent.com/maray29/86aff29d05241874f2f8adc06d05c085/raw/c7dc55836da40f9bfdb1e808b478abf38e787d11/process_diagram.html'

  // fetch(progressDiagramLink)
  //   .then((response) => response.text())
  //   .then((data) => {
  //     const processDiagramWrap = document.querySelector('.process_diagram-wrap')
  //     processDiagramWrap.insertAdjacentHTML('beforeend', data)
  //     animateProcessDiagram()
  //   })
  //   .catch((error) => {
  //     console.error('Error fetching data:', error)
  //   })

  // function setOrigin(referenceElement, targetElement) {
  //   const referenceElementRect = referenceElement.getBoundingClientRect()
  //   const targetElementRect = targetElement.getBoundingClientRect()

  //   const originX =
  //     referenceElementRect.width / 2 - (targetElementRect.left - referenceElementRect.left)
  //   const originY =
  //     referenceElementRect.height / 2 - (targetElementRect.top - referenceElementRect.top)

  //   gsap.set(targetElement, {
  //     transformOrigin: `${originX}px ${originY}px`,
  //   })
  // }

  // function animateProcessDiagram() {
  //   const diagramWrap = document.querySelector('.process_diagram-wrap')
  //   const diagramReferenceOrigin = document.querySelector('#circle-reference')
  //   const diagramLabels = document.querySelector('#labels')
  //   const diagramLargeCircles = document.querySelector('#large-circles')
  //   const diagramSmallCircles = document.querySelector('#small-circles')
  //   // Process diagram animation
  //   let currentRotation = 0

  //   setOrigin(diagramReferenceOrigin, diagramLabels)
  //   setOrigin(diagramReferenceOrigin, diagramLargeCircles)
  //   setOrigin(diagramReferenceOrigin, diagramSmallCircles)

  //   const handleWheel = (event) => {
  //     if (event.deltaY > 0) {
  //       console.log(event.deltaY)
  //       currentRotation += 45
  //     } else {
  //       currentRotation -= 45
  //     }

  //     gsap.to(diagramLabels, {
  //       duration: 1.5,
  //       rotation: currentRotation,
  //       ease: 'power1.inOut',
  //     })

  //     gsap.to(diagramLargeCircles, {
  //       duration: 1.5,
  //       rotation: -currentRotation,
  //       ease: 'power1.inOut',
  //     })

  //     gsap.to(diagramSmallCircles, {
  //       duration: 1.5,
  //       rotation: currentRotation,
  //       ease: 'power1.inOut',
  //     })
  //   }

  //   // Wrap the wheel event handler with debounce
  //   const debouncedHandleWheel = debounce(handleWheel, 500) // Adjust the delay (300ms) to your needs

  //   // Add the debounced event listener
  //   window.addEventListener('wheel', debouncedHandleWheel)
  // }

  // Prevent reloading the same page
  // const links = document.querySelectorAll('a[href]');
  // const cbk = function (e) {
  //   if (e.currentTarget.href === window.location.href) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  // };

  // for (let i = 0; i < links.length; i++) {
  //   links[i].addEventListener('click', cbk);
  // }

  // window.addEventListener('touchstart', () => {
  //   document.querySelector('.cursor').style.visibility = 'hidden';
  //   document.querySelector('.cursor-2').style.visibility = 'hidden';
  // });
})
