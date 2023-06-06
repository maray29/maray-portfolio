import SplitType from 'split-type'
import { gsap } from 'gsap'
import { debounce } from 'lodash'

export class RevealWords {
  constructor(elements) {
    this.elements = elements
    this.textRevealTimeline = []
    this.divs = []
    this.mainTimeline = gsap.timeline({ paused: true })
    this.split = []
    this.words = []
    this.reverseWords = []
    this.speed = 200
    this.backSpeed = 50
    this.documentWidth = document.documentElement.clientWidth
    this.divWidths = []
    this.isPlayed = localStorage.getItem('boolKey')

    // Initialize SplitType for each element
    this.elements.forEach((element, index) => {
      this.split[index] = new SplitType(element, { types: 'lines, words' })
      this.words[index] = this.split[index].words
      this.reverseWords[index] = this.split[index].words.toReversed()
      element.style.display = 'none'
      // element.style.visibility = 'visible'
    })

    if (this.isPlayed === 'true') {
      this.elements[this.elements.length - 1].style.display = 'block'
    }

    this.onResize()
  }

  onResize() {
    const container = document.querySelector('.home_header_heading-wrap')
    let containerWidth = container.clientWidth
    // Reposition text after the container is resized (simplified version)
    // This example uses lodash#debounce to ensure the split method only
    // gets called once after the resize is complete.
    const resizeObserver = new ResizeObserver(
      debounce(([entry]) => {
        // Note: you should add additional logic so the `split` method is only
        const containerNewWidth = entry.contentRect.width
        // called when the **width** of the container element has changed.
        if (containerNewWidth !== containerWidth) {
          this.elements.forEach((element, index) => {
            this.split[index].split()
            this.words[index] = this.split[index].words
            this.reverseWords[index] = this.split[index].words.toReversed()
          })

          containerWidth = containerNewWidth
        }
      }, 500)
    )
    resizeObserver.observe(container)
  }

  revealText(index) {
    this.elements[index].style.display = 'block'
    const tl = gsap.timeline()
    tl.set(this.elements, { autoAlpha: 1 }).fromTo(
      this.split[index].words,
      { autoAlpha: 0 },
      { autoAlpha: 1, stagger: 0.4, duration: 0.35 }
    )

    return tl
  }

  hideText(index) {
    const tl = gsap.timeline()
    tl.to(this.reverseWords[index], {
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.6,
      delay: 2,
    })

    return tl
  }

  divAnimation(index) {
    this.divs = []
    const tl = gsap.timeline()

    this.split[index].lines.forEach((line) => {
      line.style.position = 'relative'
      const words = [...line.querySelectorAll('.word')]
      const wrapper = document.querySelector('.home_header_heading-wrap')
      let computedStyles = window.getComputedStyle(wrapper)
      let paddingRight = parseFloat(computedStyles.paddingRight)
      let marginRight = parseFloat(computedStyles.marginRight)

      const wrapperRect = wrapper.getBoundingClientRect()

      const wordRect = words[words.length - 1].getBoundingClientRect()
      const lastWordRightPosition = Math.abs(this.documentWidth - wordRect.right)

      const lineRect = line.getBoundingClientRect()
      // const divWidth = Math.abs(wordRect.right - lineRect.left)
      const divWidth = wordRect.right - lineRect.left
      const rightPos = this.documentWidth - wordRect.right - wrapperRect.left

      // store divWidth for this line
      this.divWidths.push(divWidth)

      const div = document.createElement('div')
      line.appendChild(div)

      div.style.display = 'block'
      div.style.position = 'absolute'
      div.style.top = 0
      // div.style.right = `${lastWordRightPosition}px`
      div.style.right = `${rightPos}px`
      div.style.width = '0%'
      div.style.height = '100%'
      div.style.backgroundColor = 'white'

      this.divs.push(div)
    })

    this.divWidths.reverse()

    this.divs.reverse().forEach((div, i) => {
      let subTl = gsap
        .timeline()
        .to(div, {
          width: `${this.divWidths[i]}px`,
          duration: 1.0,
          delay: 2,
          onComplete: () => {
            div.style.left = '0%'
            // const words = this.split[index].lines[i].querySelectorAll('.word')
            // words.forEach((word) => {
            //   word.style.opacity = 0
            // })
          },
        })
        .to(div, {
          width: '0%',
          duration: 1.0,
        })

      tl.add(subTl, i * 0.2)
    })

    return tl
  }

  // Using promises to wait for each animation to finish
  playAnimation(index) {
    return new Promise((resolve) => {
      const tl = gsap.timeline({ delay: 1 })

      tl.add(this.revealText(index), 'start')

      // Don't hide the text on the last element
      if (index !== this.elements.length - 1) {
        tl.add(this.hideText(index), 'end').add(this.divAnimation(index), 'end')
      }
      tl.eventCallback('onComplete', resolve)
      tl.play()
    })
  }

  // Using async/await to play animations one after the other
  async play() {
    for (let i = 0; i < this.elements.length; i++) {
      await this.playAnimation(i)
      if (i !== this.elements.length - 1) {
        this.elements[i].style.display = 'none'
      }
      this.isPlayed = true
      localStorage.setItem('boolKey', this.isPlayed.toString())
    }
  }

  replay() {
    const lastElement = this.elements[this.elements.length - 1]
    gsap.to(lastElement, {
      autoAlpha: 0,
      onComplete: () => {
        lastElement.style.display = 'none'
        this.play()
      },
    })
  }
}
