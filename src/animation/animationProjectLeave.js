import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import { CONSTANTS } from '../constants.js'

const animationProjectLeave = (container, resolve) => {
  const tl = gsap.timeline({ onComplete: () => resolve() })

  tl.to(
    APP.stage.currentPlane.mesh.material.uniforms.uAlpha,
    {
      value: 0,
      duration: 0.5,
      onComplete: () => {
        APP.stage.removeCurrentPlane()
      },
    },
    'start'
  )
  // .to(APP.stage.container, {
  //   opacity: 0,
  //   duration: 0.25,
  //   delay: 0.25,
  // })
}

export default animationProjectLeave
