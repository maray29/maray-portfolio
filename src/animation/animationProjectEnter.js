import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
// import { CONSTANTS } from '../constants.js'

gsap.registerPlugin(ScrollTrigger)

const animationProjectEnter = () => {
  const projectHeading = document.querySelector('.project_heading')
  const projectNumber = document.querySelector('.project_number')
  const fadeInElements = [...document.querySelectorAll('[data-animation="fade-in"]')]

  // ScrollTrigger.refresh()
}

export default animationProjectEnter
