import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

export default class ProjectPageAnimation {
  constructor() {}

  initAnimationsOnPageLoad() {
    console.log('Initiating project page animations')

    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.refresh()

    const projectHeading = document.querySelector('.project_heading')
    const projectNumber = document.querySelector('.project_number')
    const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]

    gsap.from(
      projectHeading,
      {
        autoAlpha: 0,
        scrollTrigger: {
          trigger: projectHeading,
          start: 'center 80%',
          once: true,
        },
      },
      'start'
    )
    gsap.from(
      projectNumber,
      {
        autoAlpha: 0,
        scrollTrigger: {
          trigger: projectNumber,
          start: 'center 80%',
          once: true,
        },
      },
      'start'
    )

    fadeInElements.forEach((element) => {
      gsap.from(element, {
        autoAlpha: 0,
        stagger: 0.15,
        scrollTrigger: {
          trigger: element,
          start: 'center 80%',
          once: true,
        },
      })
    })
  }
}
