import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

import { debounce } from 'lodash'

gsap.registerPlugin(ScrollTrigger)

export default class HomePageAnimation {
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
    logo: document.querySelector('.logo_wrap'),
    navContact: document.querySelector('.nav_contact'),
    navContactSubtitle: document.querySelector('.nav_contact-subtitle'),
    sectionHeadingWraps: [...document.querySelectorAll('.section-heading_wrap')],
    projectHeadingWraps: [...document.querySelectorAll('.project_heading-wrapper')],
    projectHeadings: [...document.querySelectorAll('.project_heading')],
    projectHeadingBgs: [...document.querySelectorAll('.project_heading-bg')],
    projectNumbers: [...document.querySelectorAll('.project_number')],
    paragraphs: [...document.querySelectorAll('[data-animation="paragraph"]')],
    fadeInElements: [...document.querySelectorAll('[data-animation="fade-in"]')],
    processText: [...document.querySelectorAll('[data-animation="words"]')],
  }
  constructor() {}

  initAnimations() {
    console.log('Initiating home page animations')

    this.animateIntro()
    this.animateSectionHeadings()
    this.animateProjectHeadings()
    this.animateParagraphs()
    this.animateProcessText()
    this.animateFadeIn()
  }

  animateIntro() {
    const headerTl = gsap.timeline()
    headerTl.to('.page-wrapper', { autoAlpha: 1 })
    const logoSplit = new SplitType(this.DOM.logo, { types: `chars` })

    this.nestLettersDivs(logoSplit)

    headerTl.from(logoSplit.chars, {
      xPercent: -120,
      stagger: 0.015,
      duration: 1.0,
      ease: 'power.out4',
      autoAlpha: 0,
    })

    headerTl.from(this.DOM.navContact, {
      ease: 'power.out4',
      autoAlpha: 0,
    })

    headerTl.from(this.DOM.navContactSubtitle, {
      ease: 'power.out4',
      autoAlpha: 0,
    })
  }

  nestLettersDivs(text) {
    text.chars.forEach((el) => {
      const wrapper = document.createElement('div')
      wrapper.classList.add('char-mask')

      // insert wrapper before el in the DOM tree
      el.parentNode.insertBefore(wrapper, el)
      // move el into wrapper
      wrapper.appendChild(el)
    })
  }

  animateSectionHeadings() {
    this.DOM.sectionHeadingWraps.forEach((wrap) => {
      const sectionBg = wrap.querySelector('.section-heading_bg')

      gsap.from(sectionBg, {
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
  }

  animateProjectHeadings() {
    gsap.from(this.DOM.projectHeadings, {
      // yPercent: 120,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.35,
      scrollTrigger: {
        trigger: this.DOM.projectHeadings,
        start: 'top 80%',
        once: true,
      },
    })

    gsap.from(this.DOM.projectNumbers, {
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.35,
      scrollTrigger: {
        trigger: this.DOM.projectHeadings,
        start: 'top 80%',
        once: true,
      },
    })

    gsap.from(this.DOM.projectHeadingBgs, {
      height: 0,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.15,
      scrollTrigger: {
        trigger: this.DOM.projectHeadingBgs,
        start: 'top 80%',
        once: true,
      },
    })
  }

  animateParagraphs() {
    this.DOM.paragraphs.forEach((paragraph) => {
      const splitParagraphs = new SplitType(paragraph, {
        types: `lines`,
      })

      gsap.from(splitParagraphs.lines, {
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
  }

  animateProcessText() {
    const splitProcessText = new SplitType(this.DOM.processText, {
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

  animateFadeIn() {
    ScrollTrigger.batch(this.DOM.fadeInElements, {
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
  }
}
