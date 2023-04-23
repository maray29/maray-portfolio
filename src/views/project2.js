import gsap from 'gsap'

export const project2 = {
  name: 'from-project-transition',
  from: {
    namespace: ['project'],
  },
  leave: (data) => {
    return gsap.to(data.current.container, {
      opacity: 0,
      duration: APP.TRANSITION_DURATION,
    })
  },
  enter: (data) => {
    gsap.from(data.next.container, {
      opacity: 0,
      y: APP.TRANSITION_Y,
      duration: APP.TRANSITION_DURATION,
    })
  },
}
