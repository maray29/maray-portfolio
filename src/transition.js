import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CONSTANTS } from './constants.js'
import HomePageAnimation from './animation/HomePageAnimation.js'

import animationHomeEnter from './animation/animationHomeEnter.js'
import animationHomeLeave from './animation/animationHomeLeave.js'
import animationProjectLeave from './animation/animationProjectLeave.js'
import animationProjectEnter from './animation/animationProjectEnter.js'

gsap.registerPlugin(ScrollTrigger)

export const transitionHome = {
  namespace: ['home'],
  // Leave current page transition animation
  async leave(data) {
    console.log('Leave', data.current.namespace)
    const container = data.current.container
    await new Promise((resolve) => {
      animationHomeLeave(container, resolve)
    })
  },
  afterLeave() {
    ScrollTrigger.killAll()
  },
  // Enter next page transition animation
  enter(data) {
    console.log('Enter', data.next.namespace)
    window.scrollTo(0, 0)
    // const container = data.next.container
    // animationProjectEnter(container)
  },
  after() {
    // Important to refresh after the previous container is
    // removed
    ScrollTrigger.refresh()
  },
}

export const transitionProject = {
  // from project to whatever page
  namespace: ['project'],
  // async leave(data) {
  //   const container = data.next.container
  //   await new Promise((resolve) => {
  //     animationProjectLeave(container, resolve)
  //   })
  // },
  afterLeave() {
    ScrollTrigger.killAll()
  },
  // Enter next page transition animation
  enter(data) {
    console.log('Enter', data.next.namespace)
    // console.log('ScrollTriggers remain:', ScrollTrigger.getAll())
    const container = data.next.container
    animationHomeEnter(container)
  },
  after() {
    ScrollTrigger.refresh()
  },
}

// export const homeToProject = {
//   name: 'homeToProject',
//   from: {
//     namespace: ['home'],
//   },
//   to: {
//     namespace: ['project'],
//   },
//   async leave(data) {
//     console.log('fromHome')
//     // Create fromHome timeline
//     const projectHeadings = [...document.querySelectorAll('.project_heading')]
//     const projectNumbers = [...document.querySelectorAll('.project_number')]
//     const projectHeadingBgs = [...document.querySelectorAll('.project_heading-bg')]

//     const fromHomeTl = gsap.timeline()
//     await new Promise((resolve) => {
//       return fromHomeTl
//         .to(
//           projectHeadings,
//           {
//             yPercent: 100,
//             autoAlpha: 0,
//             duration: 0.5,
//             stagger: 0.05,
//             delay: 0.35,
//           },
//           'start'
//         )
//         .to(
//           projectNumbers,
//           {
//             // yPercent: 120,
//             autoAlpha: 0,
//             duration: 0.5,
//             stagger: 0.05,
//             delay: 0.1,
//           },
//           'start'
//         )
//         .to(
//           projectHeadingBgs,
//           {
//             height: 0,
//             autoAlpha: 0,
//             duration: 0.5,
//             stagger: 0.05,
//             delay: 0.15,
//           },
//           'start'
//         )
//         .to(data.current.container, {
//           duration: CONSTANTS.transitionDuration,
//           ease: CONSTANTS.baseEase,
//           opacity: 0,
//         })
//         .call(resolve) // Add this line to resolve the promise on timeline completion
//     })
//   },
//   enter(data) {
//     console.log('toProject')
//     const projectHeading = document.querySelector('.project_heading')
//     const projectNumber = document.querySelector('.project_number')
//     const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]

//     const toProjectTl = gsap.timeline()
//     window.scrollTo(0, 0)
//     toProjectTl
//       .to(data.current.container, {
//         duration: CONSTANTS.transitionDuration,
//         ease: CONSTANTS.baseEase,
//         autoAlpha: 1,
//       })
//       .to(
//         projectHeading,
//         {
//           autoAlpha: 1,
//         },
//         'start'
//       )
//       .to(
//         projectNumber,
//         {
//           autoAlpha: 1,
//         },
//         'start'
//       )
//       .to(
//         fadeInElements,
//         {
//           autoAlpha: 1,
//           stagger: 0.15,
//         },
//         'start'
//       )
//   },
// }

// export const projectToHome = {
//   name: 'projectToHome',
//   from: {
//     // from project to any
//     namespace: ['project'],
//   },
//   to: {
//     namespace: ['home'],
//   },
//   // async leave(data) {
//   //   console.log('fromProject')
//   //   const projectHeading = document.querySelector('.project_heading')
//   //   const projectNumber = document.querySelector('.project_number')
//   //   const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]

//   //   const fromProjectTl = gsap.timeline()
//   //   await new Promise((resolve) => {
//   //     return fromProjectTl
//   //       .to(
//   //         projectHeading,
//   //         {
//   //           opacity: 0,
//   //         },
//   //         'start'
//   //       )
//   //       .to(
//   //         projectNumber,
//   //         {
//   //           opacity: 0,
//   //         },
//   //         'start'
//   //       )
//   //       .to(
//   //         fadeInElements,
//   //         {
//   //           opacity: 0,
//   //           stagger: 0.15,
//   //         },
//   //         'start'
//   //       )
//   //       .call(resolve)
//   //   })
//   // },
//   enter({ next }) {
//     console.log('toHome')
//     animationHomeEnter(next.container)
//     // console.log('DOM before', APP.homePageAnimation.DOM)
//     // console.log('Next container:', next.container)
//     // APP.homePageAnimation.initAnimationsOnPageTransition(next.container)
//     // console.log('DOM after', APP.homePageAnimation.DOM)

//     // window.scrollTo(0, 0)

//     // const projectHeadings = [...document.querySelectorAll('.project_heading')]
//     // const projectNumbers = [...document.querySelectorAll('.project_number')]
//     // const projectHeadingBgs = [...document.querySelectorAll('.project_heading-bg')]
//     // const sectionHeadingWrap = document.querySelector('.section-heading_wrap')
//     // const sectionBg = sectionHeadingWrap.querySelector('.section-heading_bg')
//     // const sectionHeading = sectionHeadingWrap.querySelector('h2')

//     // ScrollTrigger.refresh()

//     // const fromProjectTl = gsap.timeline()
//     // fromProjectTl
//     //   .from(
//     //     sectionHeading,
//     //     {
//     //       autoAlpha: 0,
//     //       duration: 0.5,
//     //       stagger: 0.05,
//     //     },
//     //     'start'
//     //   )
//     //   .from(
//     //     sectionBg,
//     //     {
//     //       height: 0,
//     //       autoAlpha: 0,
//     //       duration: 0.5,
//     //       stagger: 0.05,
//     //     },
//     //     'start'
//     //   )
//     //   .from(
//     //     projectHeadings,
//     //     {
//     //       yPercent: 100,
//     //       autoAlpha: 0,
//     //       duration: 0.5,
//     //       stagger: 0.05,
//     //       delay: 0.2,
//     //     },
//     //     'start'
//     //   )
//     //   .from(
//     //     projectNumbers,
//     //     {
//     //       // yPercent: 120,
//     //       autoAlpha: 0,
//     //       duration: 0.5,
//     //       stagger: 0.05,
//     //       delay: 0.35,
//     //     },
//     //     'start'
//     //   )
//     //   .from(
//     //     projectHeadingBgs,
//     //     {
//     //       height: 0,
//     //       autoAlpha: 0,
//     //       duration: 0.5,
//     //       stagger: 0.05,
//     //       delay: 0.45,
//     //     },
//     //     'start'
//     //   )
//   },
// }

// function initAnimations() {
//   const projectHeadings = [...document.querySelectorAll('.project_heading')]
//   const projectNumbers = [...document.querySelectorAll('.project_number')]
//   const projectHeadingBgs = [...document.querySelectorAll('.project_heading-bg')]
//   const sectionHeadingWrap = document.querySelector('.section-heading_wrap')
//   const sectionBg = sectionHeadingWrap.querySelector('.section-heading_bg')
//   const sectionHeading = sectionHeadingWrap.querySelector('h2')

//   ScrollTrigger.refresh()

//   const fromProjectTl = gsap.timeline()
//   fromProjectTl
//     .from(
//       sectionHeading,
//       {
//         autoAlpha: 0,
//         duration: 0.5,
//         stagger: 0.05,
//       },
//       'start'
//     )
//     .from(
//       sectionBg,
//       {
//         height: 0,
//         autoAlpha: 0,
//         duration: 0.5,
//         stagger: 0.05,
//       },
//       'start'
//     )
//     .from(
//       projectHeadings,
//       {
//         yPercent: 100,
//         autoAlpha: 0,
//         duration: 0.5,
//         stagger: 0.05,
//         delay: 0.2,
//       },
//       'start'
//     )
//     .from(
//       projectNumbers,
//       {
//         // yPercent: 120,
//         autoAlpha: 0,
//         duration: 0.5,
//         stagger: 0.05,
//         delay: 0.35,
//       },
//       'start'
//     )
//     .from(
//       projectHeadingBgs,
//       {
//         height: 0,
//         autoAlpha: 0,
//         duration: 0.5,
//         stagger: 0.05,
//         delay: 0.45,
//       },
//       'start'
//     )
// }

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
