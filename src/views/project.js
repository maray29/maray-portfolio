import gsap from 'gsap'
import PlaneStatic from '../PlaneStatic.js'

import animationProjectEnter from '../animation/animationProjectEnter.js'

// Logic for project page
export const project = {
  namespace: 'project',
  beforeEnter() {
    const projectCoverWrapper = document.querySelector('.project_cover')
    gsap.set(projectCoverWrapper, {
      opacity: 0,
    })
    if (!APP.plane) {
      APP.plane = new PlaneStatic(projectCoverWrapper, APP.stage, { strength: 0.35 })
    }
  },

  afterEnter() {
    console.log('VIEW: Entering project page.')
    animationProjectEnter()
    // APP.projectPageAnimation.init()
  },
}
