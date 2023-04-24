import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import { CONSTANTS } from '../constants.js'

const animationHomeLeave = (container, resolve) => {
  const projectHeadings = [...container.querySelectorAll('.project_heading')]
  const projectNumbers = [...container.querySelectorAll('.project_number')]
  const projectHeadingBgs = [...container.querySelectorAll('.project_heading-bg')]

  ScrollTrigger.refresh()

  const tl = gsap.timeline({ onComplete: () => resolve() })

  tl.to(
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
    .to(container, {
      duration: CONSTANTS.transitionDuration,
      ease: CONSTANTS.baseEase,
      opacity: 0,
    })

  return tl
}

export default animationHomeLeave
