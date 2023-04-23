import gsap from 'gsap'
import PlaneStatic from '../PlaneStatic.js'

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

  async beforeLeave() {
    console.log(APP.stage.container)
    const fromProjectTl = gsap.timeline()
    await new Promise((resolve) => {
      return fromProjectTl
        .to(
          APP.plane.uniforms.uAlpha,
          {
            value: 0,
            duration: 0.35,
            onComplete: () => {
              APP.stage.scene.remove(APP.plane.mesh)\
              APP.plane = null
              console.log('APP.plane not removed:', APP.plane.mesh)
            },
          },
          'start'
        )
        .call(resolve)
    })
  },

  afterLeave() {
    // console.log('REMOVING PLANE')
    // APP.stage.scene.remove(APP.plane)
  },
}
