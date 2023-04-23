import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CONSTANTS } from './constants.js'

gsap.registerPlugin(ScrollTrigger)

export const homeToProject = {
  name: 'homeToProject',
  from: {
    // from home to any page
    namespace: ['home'],
  },
  to: {
    namespace: ['project'],
  },
  async leave(data) {
    console.log('fromHome')
    // Create fromHome timeline
    const projectHeadings = [...document.querySelectorAll('.project_heading')]
    const projectNumbers = [...document.querySelectorAll('.project_number')]
    const projectHeadingBgs = [...document.querySelectorAll('.project_heading-bg')]

    const fromHomeTl = gsap.timeline()
    await new Promise((resolve) => {
      return fromHomeTl
        .to(
          projectHeadings,
          {
            yPercent: 100,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.05,
            delay: 0.35,
          },
          'start'
        )
        .to(
          projectNumbers,
          {
            // yPercent: 120,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.05,
            delay: 0.1,
          },
          'start'
        )
        .to(
          projectHeadingBgs,
          {
            height: 0,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.05,
            delay: 0.15,
          },
          'start'
        )
        .to(data.current.container, {
          duration: CONSTANTS.transitionDuration,
          ease: CONSTANTS.baseEase,
          opacity: 0,
        })
        .call(resolve) // Add this line to resolve the promise on timeline completion
    })
  },
  enter(data) {
    console.log('toProject')
    window.scrollTo(0, 0)
    gsap.fromTo(
      data.next.container,
      {
        opacity: 0,
      },
      {
        duration: 1,
        ease: CONSTANTS.baseEase,
        opacity: 1,
      }
    )
  },
}

// export const home = {
//   namespace: 'home',
//   afterOnce(data) {
//     console.log(data)
//     console.log('Page loaded.')
//   },
// }

// Project out
export const projectToHome = {
  name: 'projectToHome',
  from: {
    // from project to any
    namespace: ['project'],
  },
  to: {
    namespace: ['home'],
  },
  async leave(data) {
    console.log('fromProject')
    const projectHeading = document.querySelector('.project_heading')
    const projectNumber = document.querySelector('.project_number')

    const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]

    const fromProjectTl = gsap.timeline()
    await new Promise((resolve) => {
      return fromProjectTl
        .to(
          projectHeading,
          {
            opacity: 0,
          },
          'start'
        )
        .to(
          projectNumber,
          {
            opacity: 0,
          },
          'start'
        )
        .to(
          fadeInElements,
          {
            opacity: 0,
            stagger: 0.15,
          },
          'start'
        )
        .call(resolve)
    })
  },
  async enter(data) {
    console.log('toHome')
    window.scrollTo(0, 0)

    const projectHeadings = [...document.querySelectorAll('.project_heading')]
    const projectNumbers = [...document.querySelectorAll('.project_number')]
    const projectHeadingBgs = [...document.querySelectorAll('.project_heading-bg')]
    const sectionHeadingWrap = document.querySelector('.section-heading_wrap')
    const sectionBg = sectionHeadingWrap.querySelector('.section-heading_bg')
    const sectionHeading = sectionHeadingWrap.querySelector('h2')

    const fromProjectTl = gsap.timeline()
    fromProjectTl
      .from(
        sectionHeading,
        {
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.05,
        },
        'start'
      )
      .from(
        sectionBg,
        {
          height: 0,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.05,
        },
        'start'
      )
      .from(
        projectHeadings,
        {
          yPercent: 100,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.2,
        },
        'start'
      )
      .from(
        projectNumbers,
        {
          // yPercent: 120,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.35,
        },
        'start'
      )
      .from(
        projectHeadingBgs,
        {
          height: 0,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.45,
        },
        'start'
      )
  },
}

// export const transition = {
//   name: 'transition',
//   async leave(data) {
//     await new Promise((resolve) => {
//       return gsap.to(data.current.container, {
//         duration: CONSTANTS.transitionDuration,
//         ease: CONSTANTS.baseEase,
//         opacity: 0,
//         onComplete: () => resolve(),
//       })
//     })
//   },

//   enter(data) {
//     window.scrollTo(0, 0)
//     gsap.fromTo(
//       data.next.container,
//       {
//         opacity: 0,
//       },
//       {
//         duration: 2,
//         ease: CONSTANTS.baseEase,
//         opacity: 1,
//       }
//     )
//   },
// }
