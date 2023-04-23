import gsap from 'gsap'
import PlaneHover from '../PlaneHover.js'
import { restartWebflow } from '@finsweet/ts-utils'

export const index = {
  namespace: 'home',

  beforeEnter() {
    // this.program.bodyHeight = document.body.scrollHeight
    // this.createLenis()
    const projectsImages = document.querySelectorAll('.projects_list img')
    const projectsList = document.querySelector('.projects_list')
    gsap.to(APP.stage.container, {
      opacity: 1,
    })
    if (!APP.plane) {
      APP.plane = new PlaneHover(projectsList, APP.stage, { strength: 0.35, transparent: true })
    }
  },

  beforeLeave() {
    // Do smth
  },

  afterEnter() {
    console.log('hello')
    // APP.homePageAnimation.animateProjectHeadings()

    // const projectsList = document.querySelector('.projects_list')
    // APP.plane = new PlaneHover(projectsList, APP.stage, { strength: 0.35, transparent: true })
    // APP.createLenis()
    // console.log('ADDING PLANE AFTER')
  },
}
