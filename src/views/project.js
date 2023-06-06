import gsap from 'gsap'
import PlaneStatic from '../PlaneStatic.js'

import animationProjectEnter from '../animation/animationProjectEnter.js'

// Logic for project page
export const project = {
  namespace: 'project',
  beforeEnter() {},

  afterEnter() {
    if (this.lenis) {
      this.lenis.destroy()
    }
    APP.createLenis()

    APP.projectPageAnimation.initAnimationsOnPageLoad()

    const projectCoverWrapper = document.querySelector('.project_cover')
    // gsap.set(projectCoverWrapper, {
    //   opacity: 0,
    // })
    if (APP.isFirstLoad) {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      APP.stage.initPlanes(projectCoverWrapper)
    }

    APP.isFirstLoad = false
  },

  beforeLeave() {
    gsap.to(APP.stage.currentPlane.uniforms.uAlpha, {
      value: 0,
      duration: 0.5,
      onComplete: () => {
        APP.stage.removeCurrentPlane()
      },
    })
    // APP.stage.removeCurrentPlane()
  },
}
