import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const animationHomeEnter = (container) => {
  const projectHeadings = [...container.querySelectorAll('.project_heading')]
  const projectNumbers = [...container.querySelectorAll('.project_number')]
  const projectHeadingBgs = [...container.querySelectorAll('.project_heading-bg')]
  const sectionHeadingWrap = container.querySelector('.section-heading_wrap')
  const sectionBg = sectionHeadingWrap.querySelector('.section-heading_bg')
  const sectionHeading = sectionHeadingWrap.querySelector('h2')

  ScrollTrigger.refresh()

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

  return fromProjectTl
}

export default animationHomeEnter
