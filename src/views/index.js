import gsap from 'gsap'
import PlaneHover from '../PlaneHover.js'
import { restartWebflow } from '@finsweet/ts-utils'
import HomePageAnimation from '../animation/HomePageAnimation.js'

export const index = {
  namespace: 'home',

  beforeEnter() {
    const projectsList = document.querySelector('.projects_list')
    // Move this tween to transitions?
    gsap.to(APP.stage.container, {
      opacity: 1,
    })
    if (!APP.plane) {
      APP.plane = new PlaneHover(projectsList, APP.stage, { strength: 0.35, transparent: true })
    }
  },
}
