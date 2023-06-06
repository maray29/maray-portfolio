import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

import { debounce } from 'lodash'
import { RevealWords } from '../RevealWords'

export default class HomePageAnimation {
  DOM = {}
  constructor(container) {
    this.container = container
  }

  initAnimationsOnPageLoad() {
    console.log('Initializing home page animations')
    gsap.registerPlugin(ScrollTrigger)

    this.animateNavbar()
    this.animateHeader()
    // this.animateSectionHeadings()
    this.animateProjectHeadings()
    this.animateParagraphs()
    this.animateProcessText()
    this.animateFadeIn()
    this.addEventListeners()
    this.createProcessDiagram()
  }

  killScrollTriggers() {
    ScrollTrigger.getAll().forEach((st) => st.kill())
  }

  // get DOMElements() {
  //   // let DOM = {}
  //   return {
  //     logo: document.querySelector('.logo_wrap'),
  //     navContact: document.querySelector('.nav_contact'),
  //     navContactSubtitle: document.querySelector('.nav_contact-subtitle'),
  //     container: this.container.querySelector('.canvas-container'),
  //     itemsWrapper: this.container.querySelector('.projects_list'),
  //     home: {
  //       el: this.container.querySelector('.projects_list'),
  //     },
  //     project: {
  //       el: this.container.querySelector('.project_cover'),
  //     },
  //     mouse: {
  //       cursor1: this.container.querySelector('.cursor-inner'),
  //       cursor2: this.container.querySelector('.cursor-outer'),
  //     },
  //     sectionHeadingWraps: [...this.container.querySelectorAll('.section-heading_wrap')],
  //     projectHeadingWraps: [...this.container.querySelectorAll('.project_heading-wrapper')],
  //     projectHeadings: [...this.container.querySelectorAll('.project_heading')],
  //     projectHeadingBgs: [...this.container.querySelectorAll('.project_heading-bg')],
  //     projectNumbers: [...this.container.querySelectorAll('.project_number')],
  //     paragraphs: [...this.container.querySelectorAll('[data-animation="paragraph"]')],
  //     fadeInElements: [...this.container.querySelectorAll('[data-animation="fade-in"]')],
  //     processText: [...this.container.querySelectorAll('[data-animation="words"]')],
  //   }
  // }

  animateNavbar() {
    const logo = document.querySelector('.logo_wrap')
    const navContact = document.querySelector('.nav_contact')
    const navContactSubtitle = document.querySelector('.nav_contact-subtitle')

    const tl = gsap.timeline()

    const logoSplit = new SplitType(logo, { types: `chars` })
    this.nestLettersDivs(logoSplit)

    return tl
      .to('.page-wrapper', { autoAlpha: 1 })
      .from(logoSplit.chars, {
        xPercent: -120,
        stagger: 0.015,
        duration: 1.0,
        ease: 'power.out4',
        autoAlpha: 0,
      })

      .from(navContact, {
        ease: 'power.out4',
        autoAlpha: 0,
        onComplete: () => {
          'complete'
        },
      })

      .from(navContactSubtitle, {
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

  animateHeader() {
    const elements = [...document.querySelectorAll('.home_header_heading')]

    this.revealText = new RevealWords(elements)

    let isHeaderAnimationPlayed = localStorage.getItem('boolKey') === 'true'
    if (!isHeaderAnimationPlayed) {
      this.revealText.play()
    } else {
      gsap.from('.home_header_heading', {
        autoAlpha: 0,
        delay: 1.0,
        duration: 1.5,
      })
      gsap.from('.home_header_cta-wrap', {
        autoAlpha: 0,
        delay: 1.5,
        duration: 0.5,
      })
    }
  }

  onPlayButtonClick() {
    let boolValue = true
    this.revealText.replay()
    localStorage.setItem('boolKey', boolValue.toString())
  }

  animateSectionHeadings() {
    // gsap.registerPlugin(ScrollTrigger)

    const sectionHeadingWraps = [...document.querySelectorAll('.section-heading_wrap')]

    sectionHeadingWraps.forEach((wrap) => {
      const sectionBg = wrap.querySelector('.section-heading_bg')

      gsap.set(sectionBg, {
        height: '0%',
        autoAlpha: 0,
      })
      gsap.to(sectionBg, {
        autoAlpha: 1,
        height: '100%',
        duration: 0.75,
        // delay: 0.25,
        scrollTrigger: {
          trigger: wrap,
          start: 'top 70%',
          once: true,
        },
      })
    })
  }

  animateProjectHeadings() {
    const projectHeadings = [...document.querySelectorAll('.project_link')]
    const projectHeadingsWrapper = document.querySelector('.project_list')
    const projectNumbers = [...document.querySelectorAll('.project_number')]

    gsap.set(projectHeadings, {
      autoAlpha: 0,
    })
    gsap.to(projectHeadings, {
      autoAlpha: 1,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.5,
      scrollTrigger: {
        trigger: projectHeadingsWrapper,
        start: 'top 70%',
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
  }

  projectLinkMouseEnter(link) {
    const projectLinks = [...document.querySelectorAll('.project_link')]
    const otherProjects = projectLinks.filter((project) => project !== link)
    gsap.to(otherProjects, {
      opacity: 0.25,
      duration: 0.25,
      ease: 'power2.out',
    })

    const projectHeading = link.querySelector('.project_heading')
  }

  projectLinkMouseLeave(link) {
    const projectLinks = [...document.querySelectorAll('.project_link')]
    const otherProjects = projectLinks.filter((project) => project !== link)
    gsap.to(otherProjects, {
      opacity: 1.0,
      duration: 0.25,
      // ease: 'power2.out',
    })

    const projectHeading = link.querySelector('.project_heading')
  }

  animateParagraphs() {
    gsap.registerPlugin(ScrollTrigger)

    const paragraphs = [...document.querySelectorAll('[data-animation="paragraph"]')]

    paragraphs.forEach((paragraph) => {
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

  // animateProcessText2(container) {
  //   gsap.registerPlugin(ScrollTrigger)

  //   const processText = [...container.querySelectorAll('[data-animation="words"]')]

  //   const splitProcessText = new SplitType(processText, {
  //     types: `lines`,
  //   })
  //   splitProcessText.lines.forEach((line) => {
  //     const splitLines = new SplitType(line, { types: `words` })
  //     gsap.set(splitLines.words, {
  //       autoAlpha: 0.1,
  //     })
  //     gsap.to(splitLines.words, {
  //       autoAlpha: 1,
  //       stagger: 0.15,
  //       duration: 0.75,
  //       ease: 'power.out4',
  //       delay: 0.25,
  //       scrollTrigger: {
  //         trigger: line,
  //         start: 'top center',
  //         end: 'bottom center',
  //         scrub: 1,
  //         // once: true,
  //       },
  //     })

  //     // return tl
  //   })
  // }

  animateFadeIn() {
    const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]
    ScrollTrigger.batch(fadeInElements, {
      start: 'top center',
      once: true,
      onEnter: (batch) => {
        console.log('entering')
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

  addEventListeners() {
    const projectLinks = [...document.querySelectorAll('.project_link')]

    projectLinks.forEach((link) => {
      link.addEventListener('mouseenter', this.projectLinkMouseEnter.bind(this, link))
      link.addEventListener('mouseleave', this.projectLinkMouseLeave.bind(this, link))
    })

    const playButton = document.querySelector('.button_circle')
    if (playButton) {
      playButton.addEventListener('click', this.onPlayButtonClick.bind(this))
    }
  }

  createProcessDiagram() {
    // Fetch the svg from github and append to the embed div
    const progressDiagramLink =
      'https://gist.githubusercontent.com/maray29/86aff29d05241874f2f8adc06d05c085/raw/c7dc55836da40f9bfdb1e808b478abf38e787d11/process_diagram.html'

    fetch(progressDiagramLink)
      .then((response) => response.text())
      .then((data) => {
        const processDiagramWrap = document.querySelector('.process_diagram-wrap')
        processDiagramWrap.insertAdjacentHTML('beforeend', data)
        this.animateProgressDiagram()
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }

  #setOrigin(referenceElement, targetElement) {
    const referenceElementRect = referenceElement.getBoundingClientRect()
    const targetElementRect = targetElement.getBoundingClientRect()

    const originX =
      referenceElementRect.width / 2 - (targetElementRect.left - referenceElementRect.left)
    const originY =
      referenceElementRect.height / 2 - (targetElementRect.top - referenceElementRect.top)

    gsap.set(targetElement, {
      transformOrigin: `${originX}px ${originY}px`,
    })
  }

  animateProgressDiagram() {
    const diagramWrap = document.querySelector('.process_diagram-wrap')
    const diagramReferenceOrigin = document.querySelector('#circle-reference')
    const diagramLabels = document.querySelector('#labels')
    const diagramLargeCircles = document.querySelector('#large-circles')
    const diagramSmallCircles = document.querySelector('#small-circles')

    let currentRotation = 0

    this.#setOrigin(diagramReferenceOrigin, diagramLabels)
    this.#setOrigin(diagramReferenceOrigin, diagramLargeCircles)
    this.#setOrigin(diagramReferenceOrigin, diagramSmallCircles)

    const handleWheel = (event) => {
      if (event.deltaY > 0) {
        currentRotation += 45
      } else {
        currentRotation -= 45
      }

      gsap.to(diagramLabels, {
        duration: 1.5,
        rotation: currentRotation,
        ease: 'power1.inOut',
      })

      gsap.to(diagramLargeCircles, {
        duration: 1.5,
        rotation: -currentRotation,
        ease: 'power1.inOut',
      })

      gsap.to(diagramSmallCircles, {
        duration: 1.5,
        rotation: currentRotation,
        ease: 'power1.inOut',
      })
    }

    // Wrap the wheel event handler with debounce
    const debouncedHandleWheel = debounce(handleWheel, 500) // Adjust the delay (300ms) to your needs

    // Add the debounced event listener
    window.addEventListener('wheel', debouncedHandleWheel)
  }
}
