import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

import { debounce } from 'lodash'

gsap.registerPlugin(ScrollTrigger)

export default class HomePageAnimation {
  DOM = {}
  constructor(container) {
    this.container = container
  }

  initAnimationsOnPageLoad() {
    console.log('Initiating home page animations')

    this.DOM = this.DOMElements
    this.animateNavbar()
    this.animateSectionHeadings()
    this.animateProjectHeadings()
    this.animateParagraphs()
    this.animateProcessText()
    this.animateFadeIn()
  }

  initAnimationsOnPageTransition(container) {
    this.container = container
    this.DOM = this.DOMElements
    // this.animateSectionHeadings()
    this.animateProjectHeadings()
    // this.animateParagraphs()
    // this.animateProcessText()
    // this.animateFadeIn()
  }

  resetAnimations() {
    ScrollTrigger.getAll().forEach((st) => st.kill())
    // this.initAnimations()
  }

  get DOMElements() {
    // let DOM = {}
    return {
      logo: document.querySelector('.logo_wrap'),
      navContact: document.querySelector('.nav_contact'),
      navContactSubtitle: document.querySelector('.nav_contact-subtitle'),
      container: this.container.querySelector('.canvas-container'),
      itemsWrapper: this.container.querySelector('.projects_list'),
      home: {
        el: this.container.querySelector('.projects_list'),
      },
      project: {
        el: this.container.querySelector('.project_cover'),
      },
      mouse: {
        cursor1: this.container.querySelector('.cursor-inner'),
        cursor2: this.container.querySelector('.cursor-outer'),
      },
      sectionHeadingWraps: [...this.container.querySelectorAll('.section-heading_wrap')],
      projectHeadingWraps: [...this.container.querySelectorAll('.project_heading-wrapper')],
      projectHeadings: [...this.container.querySelectorAll('.project_heading')],
      projectHeadingBgs: [...this.container.querySelectorAll('.project_heading-bg')],
      projectNumbers: [...this.container.querySelectorAll('.project_number')],
      paragraphs: [...this.container.querySelectorAll('[data-animation="paragraph"]')],
      fadeInElements: [...this.container.querySelectorAll('[data-animation="fade-in"]')],
      processText: [...this.container.querySelectorAll('[data-animation="words"]')],
    }
  }

  animateNavbar() {
    const headerTl = gsap.timeline()

    const logoSplit = new SplitType(this.DOM.logo, { types: `chars` })
    this.nestLettersDivs(logoSplit)

    return headerTl
      .to('.page-wrapper', { autoAlpha: 1 })
      .from(logoSplit.chars, {
        xPercent: -120,
        stagger: 0.015,
        duration: 1.0,
        ease: 'power.out4',
        autoAlpha: 0,
      })

      .from(this.DOM.navContact, {
        ease: 'power.out4',
        autoAlpha: 0,
      })

      .from(this.DOM.navContactSubtitle, {
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
    console.log('Animating project headings:', this.DOM.projectHeadings)

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
    gsap.registerPlugin(ScrollTrigger)

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

      // return tl
    })
  }

  animateProcessText2(container) {
    gsap.registerPlugin(ScrollTrigger)

    const processText = [...container.querySelectorAll('[data-animation="words"]')]

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

      // return tl
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
