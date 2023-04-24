import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

export default class ProjectPageAnimation {
  constructor() {}

  initAnimationsOnPageLoad() {
    console.log('Initiating project page animations')
  }

  init() {
    console.log('Init')
  }
}
