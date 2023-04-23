import PlaneBaseNew from './PlaneBaseNew.js'
import * as THREE from 'three'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { doc } from 'prettier'

export default class PlaneHover extends PlaneBaseNew {
  constructor(itemsWrapper, stage, options = { transparent: true }) {
    super(itemsWrapper, stage, options)
  }

  onMouseClick(event) {
    this.isMoving = true

    const initialWidth = this.plane.scale.x
    const initialHeight = this.plane.scale.y

    const container = document.querySelector('.container-huge').getBoundingClientRect()
    const aspectRatio = this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight

    const scaleX = (container.width - window.innerWidth * 0.25) / initialWidth

    // Calculate offset
    const heightAfterScale = initialHeight * scaleX
    const widthAfterScale = initialWidth * scaleX

    const navbarHeight = document.querySelector('.nav').getBoundingClientRect().height
    const offsetY = window.innerHeight / 2 - heightAfterScale / 2 - navbarHeight
    // const offsetX =
    //   window.innerWidth / 2 - widthAfterScale / 2 - (window.innerWidth - container.right)
    const offsetX = Math.abs(window.innerWidth / 2 - widthAfterScale / 2 - container.left)

    const targetPosition = { x: -offsetX, y: offsetY, z: this.plane.position.z }
    const screenCenter = { x: 0, y: 0, z: this.plane.position.z }

    const scale_duration = 1.25
    const ease = CustomEase.create(
      'custom',
      'M0,0,C0.426,-0.01,0.422,0.572,0.54,0.76,0.64,0.946,0.818,1.001,1,1'
    )

    if (this.clickedTimeline) this.clickTimeline.kill()

    this.clickTimeline = gsap.timeline({ paused: true })

    // Use GSAP to tween the plane's position and scale
    this.clickTimeline.to(
      this.plane.position,
      {
        x: screenCenter.x,
        y: screenCenter.y,
        z: screenCenter.z,
        duration: 1,
        overwrite: true,
        ease: CustomEase.create(
          'custom',
          'M0,0 C0.134,0.03 0.244,0.09 0.298,0.168 0.395,0.308 0.423,0.682 0.55,0.82 0.631,0.908 0.752,1 1,1 '
        ),
        onComplete: () => {
          this.onPositionUpdate.bind(this)
          this.initialPos.copy(this.plane.position)
        },
      },
      'start'
    )

    this.clickTimeline.to(
      this.uniforms.uOffset.value,
      {
        x: 0.0,
        y: 0.0,
      },
      'start'
    )

    this.clickTimeline.to(
      this.plane.position,
      {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: scale_duration,
        // overwrite: true,
        ease: ease,
        onComplete: () => {
          this.onPositionUpdate.bind(this)
          this.initialPos.copy(this.plane.position)
        },
      },
      'scale'
    )

    this.clickTimeline.to(
      this.uniforms.scale,
      {
        value: scaleX,
        duration: scale_duration,
        ease: ease,
      },
      'scale'
    )

    // Scaling the mesh in addition to uniform create a pretty cool effect
    // Uncomment the following code to see how it folds
    // Also saved a screenshot in Figma
    // Perhaps extend the base plane to PlaneHoverFold

    // this.clickTimeline.to(
    //   this.plane.scale,
    //   {
    //     x: scaleX,
    //     y: 2000,
    //     duration: scale_duration,
    //     ease: ease,
    //     onComplete: () => {
    //       console.log('Plane scale after:', this.plane.scale)
    //     },
    //   },
    //   'scale'
    // )

    // const move =
    //   this.plane.position.x + window.innerWidth / 2 + this.plane.geometry.parameters.width
    // console.log('move', move)

    // this.clickTimeline.to(
    //   this.plane.position,
    //   {
    //     x: move,
    //     duration: scale_duration,
    //     ease: ease,
    //   },
    //   'scale'
    // )

    this.clickTimeline.to(
      this.uniforms.progress,
      {
        value: 1.0,
        duration: scale_duration,
        ease: ease,
        onComplete: () => {
          this.isMoving = false
        },
      },
      'scale'
    )

    this.clickTimeline.play()
  }

  onMouseOver(index, e) {
    // console.log('onMouseOver')
    if (this.isMoving) return
    if (!this.isLoaded) return
    this.onMouseEnter()
    if (this.currentItem && this.currentItem.index === index) return
    this.onTargetChange(index)
  }

  onMouseEnter() {
    // console.log('onMouseEnter')
    if (this.isMoving) return
    if (!this.currentItem || !this.isMouseOver) {
      this.isMouseOver = true
      // show plane
      gsap.to(this.uniforms.uAlpha, {
        value: 1,
        ease: 'power4.out',
        duration: 0.5,
      })
    }
  }

  onMouseLeave(event) {
    // console.log('onMouseLeave')
    if (this.isMoving) return
    gsap.to(this.uniforms.uAlpha, {
      value: 0,
      ease: 'power4.out',
      duration: 0.5,
    })
  }

  onMouseMove() {
    // console.log('onMouseMove')
    if (this.isMoving) return

    this.uniforms.mousePos.value.copy(this.mouseNormal)

    this.position = new THREE.Vector3(this.mouseMapped.x, this.mouseMapped.y, 0)

    this.mouseOverAnimation = gsap.to(this.plane.position, {
      x: this.mouseMapped.x,
      y: this.mouseMapped.y,
      ease: 'power4.out',
      duration: 1.5,
      onUpdate: this.onPositionUpdate.bind(this),
    })
  }

  onPositionUpdate() {
    // compute offset
    if (!this.isMoving) {
      this.initialPos.y = this.plane.position.y - this.scrollY
      // This works but when the mesh stops moving before scroll

      let offset = this.plane.position
        .clone()
        .sub(this.position)
        .multiplyScalar(-this.options.strength)
      this.currentOffset = offset

      this.currentOffset.x = this.currentOffset.x / (window.innerWidth / 2)
      this.currentOffset.y = this.currentOffset.y / (window.innerHeight / 2)

      this.uniforms.uOffset.value = this.currentOffset
    }
  }

  onTargetChange(index) {
    if (this.isMoving) return

    // Reset uniform values
    this.uniforms.progress.value = 0
    this.uniforms.scale.value = this.initialScale

    // item target changed
    this.currentItem = this.items[index]
    if (!this.currentItem.texture) {
      console.log('There is no texture')
      return
    }

    // compute image ratio
    let imageRatio = this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight
    // let imageRatio = this.currentItem.img.naturalHeight / this.currentItem.img.naturalWidth
    let bounds = {
      width: this.currentItem.img.naturalWidth,
      height: this.currentItem.img.naturalHeight,
    }
    this.uniforms.aspectRatio.value = imageRatio
    this.scale = new THREE.Vector3(imageRatio, 1, 1)
    this.uniforms.uTexture.value = this.currentItem.texture
    // this.plane.scale.copy(this.scale)
    this.plane.scale.set(bounds.width, bounds.height, 1)
  }
}
