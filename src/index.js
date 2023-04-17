import barba from '@barba/core'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

import { RGBShiftEffect } from './RGBShiftEffect.js'

gsap.registerPlugin(ScrollTrigger)

class App {
  lenis
  program
  DOM = {
    container: document.querySelector('.canvas-container'),
    itemsWrapper: document.querySelector('.projects_list'),
  }
  constructor() {
    this.init()
  }

  init() {
    this.createLenis()

    // Init three.js
    this.program = new RGBShiftEffect(this.DOM.container, this.DOM.itemsWrapper, {
      strength: 0.35,
    })

    const transitionDuration = 0.75
    const transitionY = '20vh'

    barba.init({
      transitions: [
        {
          name: 'from-home-transition',
          from: {
            namespace: ['home'],
          },
          leave: (data) => {
            return gsap.to(data.current.container, {
              opacity: 0,
              duration: transitionDuration,
            })
          },
          beforeEnter: (data) => {
            console.log(this.lenis)
            console.log(this.program.plane.position.y)
            // this.program.contentHeight = document.body.offsetHeight
            this.program.bodyHeight = document.body.scrollHeight
          },
          enter: (data) => {
            return gsap.from(data.next.container, {
              opacity: 0,
              duration: transitionDuration,
            })
          },
        },
        {
          name: 'from-project-transition',
          from: {
            namespace: ['project'],
          },
          leave: (data) => {
            return gsap.to(data.current.container, {
              opacity: 0,
              duration: transitionDuration,
            })
          },
          enter: (data) => {
            gsap.from(data.next.container, {
              opacity: 0,
              y: transitionY,
              duration: transitionDuration,
            })
          },
        },
      ],
    })
  }

  createLenis() {
    this.lenis = new Lenis({
      duration: 2.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      orientation: 'vertical', // vertical, horizontal
      gestureOrientation: 'vertical', // vertical, horizontal, both
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      normalizeWheel: true,
    })

    this.lenis.on('scroll', ({ scroll }) => {
      // update our scroll manager values
      this.program.updateScrollValues(0, scroll)
      this.program.scrollY = scroll

      // if (this.program.lockScroll) {
      //   this.lenis.stop()
      // }
    })

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000)
    })
  }
}

window.Webflow ||= []
window.Webflow.push(() => {
  const app = new App()

  gsap.set('.page-wrapper', { visibility: 'visible' })
  // Fetch the svg from github and append to the embed div
  const progressDiagramLink =
    'https://gist.githubusercontent.com/maray29/86aff29d05241874f2f8adc06d05c085/raw/c7dc55836da40f9bfdb1e808b478abf38e787d11/process_diagram.html'

  fetch(progressDiagramLink)
    .then((response) => response.text())
    .then((data) => {
      const processDiagramWrap = document.querySelector('.process_diagram-wrap')
      processDiagramWrap.insertAdjacentHTML('beforeend', data)
      animateProcessDiagram()
    })
    .catch((error) => {
      console.error('Error fetching data:', error)
    })

  function setOrigin(referenceElement, targetElement) {
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

  function animateProcessDiagram() {
    // Process diagram animation
    const diagramWrap = document.querySelector('.process_diagram-wrap')
    const diagramReferenceOrigin = document.querySelector('#circle-reference')
    const diagramLabels = document.querySelector('#labels')
    const diagramLargeCircles = document.querySelector('#large-circles')
    const diagramSmallCircles = document.querySelector('#small-circles')
    let currentRotation = 0

    setOrigin(diagramReferenceOrigin, diagramLabels)
    setOrigin(diagramReferenceOrigin, diagramLargeCircles)
    setOrigin(diagramReferenceOrigin, diagramSmallCircles)

    window.addEventListener('wheel', (event) => {
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
    })
  }

  // Section heading animation
  const sectionHeadingWraps = [...document.querySelectorAll('.section-heading_wrap')]

  sectionHeadingWraps.forEach((wrap) => {
    const headingBg = wrap.querySelector('.section-heading_bg')
    // const heading = wrap.querySelector('h2');

    gsap.from(headingBg, {
      height: 0,
      duration: 0.75,
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

  let splitText
  let lines

  function runSplit() {
    const currentElement = document.querySelectorAll('.process_text')

    splitText = new SplitType(currentElement, { types: 'lines, chars' })

    // lines = document.querySelectorAll(".line");
    lines = splitText.lines

    lines.forEach((line) => {
      const lineMask = document.createElement('div')
      lineMask.classList.add('line-mask')
      line.append(lineMask)
    })
  }

  runSplit()

  window.addEventListener('resize', function () {
    splitText.revert()
    runSplit()
  })

  function lineMaskAnimation() {
    gsap.registerPlugin(ScrollTrigger)
    lines.forEach((line) => {
      const triggerElement = line
      const targetElement = line.querySelector('.line-mask')
      // console.log(triggerElement);

      gsap.to(targetElement, {
        width: '0%',
        duration: 3,
        scrollTrigger: {
          trigger: triggerElement,
          start: 'top 70%',
          end: '+=400',
          scrub: 1,
        },
      })
    })
  }

  lineMaskAnimation()

  let bodyScrollPosition = 0

  function getScrollPosition() {
    bodyScrollPosition = $(window).scrollTop()
  }

  function updateScroll(position = 0) {
    $(window).scrollTop(position)
  }

  let text
  let description

  function runSplit2() {
    // Split text into words and characters
    text = new SplitType('.home_heading', { types: 'lines, words, chars' })
    // description = new SplitType(".portfolio-header_description", {
    //   types: "lines, words, chars"
    // });
  }
  const logo = document.querySelector('.nav1_logo-link')
  const contactLink = document.querySelector('.nav1_contact')

  function animateHeading() {
    // Animate characters into view with a stagger effect

    // gsap.set(".home_heading", { visibility: "visible" });

    const headerTl = gsap.timeline()

    // headerTl.set('.page-wrapper', { visibility: 'visible' });
    // headerTl.set('.page-wrapper', {
    //   autoalpha: 1,
    // });

    // Animate characters into view with a stagger effect
    headerTl.from(text.chars, {
      duration: 1,
      autoAlpha: 0,
      yPercent: 150,
      stagger: 0.01,
      ease: 'expo.out',
    })

    headerTl.from(
      logo,
      {
        opacity: 0,
        duration: 0.75,
      },
      '<0.85'
    )

    headerTl.from(
      contactLink,
      {
        opacity: 0,
        duration: 0.5,
      },
      '<0.5'
    )
  }

  runSplit2()
  animateHeading()

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
