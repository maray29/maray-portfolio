import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PlaneHover from '../PlaneHover.js'
import PlaneProject from '../PlaneProject.js'
import { restartWebflow } from '@finsweet/ts-utils'

// const APP = window.APP

export const index = {
  namespace: 'home',

  beforeLeave() {
    // APP.homePageAnimation.killScrollTriggers()
    console.log('Current Plane: ', APP.stage.currentPlane)
  },

  beforeEnter() {
    // if (!APP.isFirstLoad) {
    //   gsap.to(APP.stage.container, {
    //     opacity: 1,
    //   })
    // }
  },
  afterEnter() {
    if (this.lenis) {
      this.lenis.destroy()
    }
    APP.createLenis()

    const projectsList = document.querySelector('.home_projects')
    APP.stage.initPlanes(projectsList)

    if (APP.isFirstLoad) {
      APP.homePageAnimation.initAnimationsOnPageLoad()
    }

    if (!APP.isFirstLoad) {
      gsap.registerPlugin(ScrollTrigger)
      ScrollTrigger.refresh()

      APP.homePageAnimation.animateSectionHeadings()
      APP.homePageAnimation.animateProcessText()
      APP.homePageAnimation.animateParagraphs()
      APP.homePageAnimation.animateFadeIn()

      // APP.homePageAnimation.animateProgressDiagram()
      // APP.homePageAnimation.createProgressDiagram()
    }

    APP.isFirstLoad = false
  },
}
