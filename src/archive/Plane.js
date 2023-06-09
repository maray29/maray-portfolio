import './utils/math'

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import * as THREE from 'three'

import PlaneBase from './PlaneBase.js'
import fragmentShader from './shaders/fragmentShader.glsl'
import vertexShader from './shaders/vertexShader.glsl'

gsap.registerPlugin(CustomEase)

export class Plane extends PlaneBase {
  constructor(
    container = document.querySelector('.canvas-container'),
    itemsWrapper = null,
    options = {}
  ) {
    super(container, itemsWrapper)
    if (!this.container || !this.itemsWrapper) return

    options.strength = options.strength || 0.25
    this.options = options

    this.isMoving = false

    this.mouse = {
      x: 0,
      y: 0,
    }
    this.currentOffset

    this.lastXDelta = 0
    this.lastYDelta = 0
    this.xOffset = 0
    this.yOffset = 0

    this.contentHeight = document.body.offsetHeight

    this.bodyHeight = document.body.scrollHeight
    this.windowHeight = window.innerHeight

    this.initialPos = new THREE.Vector3(0, 0, 0)
    this.scrollY = 0
    this.isScrolling = false
    this.lockScroll = false
    this.isAnimating = false
    this.initialScale = 0.75

    this.pageScrolledToEnd = false

    // this.currentItem = this.items[0]

    // setTimeout(() => {
    //   console.log('Delayed current item texture:', this.currentItem.texture)
    //   this.init()
    // }, 1000)

    this.initializeAndInit()
  }

  async initializeAndInit() {
    await this.initialize()
    this.init()
  }

  init() {
    this.itemBounds = {
      width: this.currentItem.img.naturalWidth,
      height: this.currentItem.img.naturalHeight,
    }

    console.log('items:', this.items)
    console.log('current item:', this.currentItem)
    console.log('current item img:', this.currentItem.img)
    console.log('current item texture:', this.currentItem.texture)
    console.log('current item img width:', this.currentItem.img.naturalWidth)
    console.log('this.itemBounds:', this.itemBounds)
    this.position = new THREE.Vector3(1, 1, 0)
    this.scale = new THREE.Vector3(1, 1, 1)
    // Plane size
    this.geometry = new THREE.PlaneGeometry(1, 1, 1000, 1000)
    this.uniforms = {
      uTime: {
        value: 0,
      },
      uTexture: {
        value: this.currentItem.texture,
      },
      uOffset: {
        value: new THREE.Vector2(0.0, 0.0),
      },
      uAlpha: {
        value: 1,
      },
      scale: {
        value: this.initialScale,
      },
      aspectRatio: {
        value: 0.5,
      },
      progress: { value: 0 }, // Start with progress = 0
      trailIntensity: { value: 0.1 }, // You can adjust this value to control the trail length
      trailDuration: { value: 0.5 }, // You can adjust this value to control the trail duration
      mousePos: { value: new THREE.Vector2(0.0, 0.0) },
    }
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    })
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane.scale.set(this.itemBounds.width, this.itemBounds.height, 1)
    console.log('this.plane.scale', this.plane.scale)
    this.scene.add(this.plane)

    console.log('current item texture2:', this.currentItem.texture)
    console.log('current item2:', this.currentItem)
  }

  _setPlane() {
    this.currentItem = this.items[0]
    this.uniforms.uTexture.value = this.currentItem.texture
    gsap.to(this.plane.position, {
      x: 0,
      y: 0,
    })
    gsap.to(this.uniforms.uAlpha, {
      value: 1,
      ease: 'power4.out',
      duration: 0.5,
    })
  }

  updateScrollValues(x, scrollY) {
    // get our scroll delta values
    const lastScrollYValue = this.yOffset
    this.yOffset = scrollY
    this.lastYDelta = lastScrollYValue - this.yOffset

    if (lastScrollYValue !== scrollY) {
      // console.log('Page is scrolling')
      this.isScrolling = true
    } else {
      // console.log('Page is not scrolling')
      this.isScrolling = false
    }

    // Calculate the plane's new Y position
    this.scrollableHeight = this.bodyHeight - this.windowHeight

    if (!this.pageScrolledToEnd) {
      this.newPosY =
        this.initialPos.y +
        (scrollY / this.scrollableHeight) * (this.bodyHeight - this.windowHeight)
    }

    // Update the plane's Y position
    // if (!this.isMoving) this.plane.position.setY(this.newPosY)

    if (!this.isMoving) {
      gsap.to(this.plane.position, {
        y: this.newPosY,
        // overwrite: true,
        duration: 0.25,
        // onComplete: () => {
        //   console.log(this.plane.position)
        // },
      })
    }
  }

  onMouseClick(event) {
    this.isMoving = true

    // Move the plane to the center of the screen
    const targetPosition = { x: 0, y: 0, z: this.plane.position.z }

    const initialWidth = this.plane.geometry.parameters.width * this.plane.scale.x
    const initialHeight = this.plane.geometry.parameters.height * this.plane.scale.y

    const scaleX = this.viewport.width / initialWidth
    const scaleY = this.viewport.height / initialHeight

    const scaleFactor = Math.min(scaleX, scaleY) * 0.75

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
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
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
      this.uniforms.scale,
      {
        value: scaleFactor,
        duration: scale_duration,
        ease: ease,
      },
      'scale'
    )

    this.clickTimeline.to(
      this.uniforms.progress,
      {
        value: 1.0,
        duration: scale_duration,
        ease: ease,
        onComplete: () => {
          this.isMoving = false
          this.lockScroll = false
        },
      },
      'scale'
    )

    this.clickTimeline.play()
  }

  onMouseOver(index, e) {
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

  // This event should only fire when the page is not being scrolled
  onMouseMove() {
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
    if (!this.currentItem.texture) return

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
