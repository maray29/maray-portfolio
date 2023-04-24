import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
// import { CONSTANTS } from '../constants.js'

gsap.registerPlugin(ScrollTrigger)

const animationProjectEnter = () => {
  const projectHeading = document.querySelector('.project_heading')
  const projectNumber = document.querySelector('.project_number')
  const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]

  ScrollTrigger.refresh()

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

export default animationProjectEnter
