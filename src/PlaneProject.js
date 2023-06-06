import PlaneBaseNew from './PlaneBaseNew.js'
import * as THREE from 'three'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

import fragmentShader from './shaders/planeFragment.glsl'
import vertexShader from './shaders/planeVertex.glsl'

export default class PlaneProject {
  constructor(item, stage) {
    this.item = item
    this.stage = stage
    this.initialPos = new THREE.Vector3(0, 0, 0)
    this.initialScale = new THREE.Vector3(1, 1, 1)
    this.mouse = new THREE.Vector2()
    this.mouseMapped = new THREE.Vector2()
    this.mouseNormal = new THREE.Vector2()

    this.currentOffset = 0

    this.createMesh()
    this.isLoaded = true
    // this.setPlanePosition()
    // this.setPlaneScale()
    this.createEventsListeners()
  }

  setPlanePosition() {
    // Calculate top offset and replace hard coded value
    const imgRect = this.item.img.getBoundingClientRect()
    this.mesh.position.set(imgRect.left, imgRect.top)
    this.initialPos.y = this.mesh.position.y
  }

  setPlaneScale() {
    this.imgSize = this.item.img.getBoundingClientRect()
    this.mesh.scale.set(this.imgSize.width, this.imgSize.height, 1)
    console.log(this.mesh.scale)
  }

  createMesh() {
    // Plane size

    // console.log(this.item.texture)
    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100)
    this.uniforms = {
      uTime: {
        value: 0,
      },
      uTexture: {
        value: this.item.texture,
      },
      uOffset: {
        value: new THREE.Vector2(0.0, 0.0),
      },
      uAlpha: {
        value: 1,
      },
      scale: {
        value: 1.0,
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
      //   transparent: true,
    })

    this.material2 = new THREE.MeshPhysicalMaterial({ color: 0xffff1e })
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    const imgRect = this.item.img.getBoundingClientRect()
    this.mesh.scale.set(imgRect.width, imgRect.height, 1)

    const x = imgRect.left + imgRect.width / 2 - window.innerWidth / 2
    const y = -(imgRect.top + imgRect.height / 2 + window.scrollY - window.innerHeight / 2)

    this.mesh.position.set(x, y, 1)
    console.log(
      '🚀 ~ file: PlaneProject.js:86 ~ PlaneProject ~ createMesh ~ this.mesh:',
      this.mesh.material.uniforms.scale
    )
    // this.mesh.material.uniforms.scale.value = this.mesh.scale
    // this.mesh.position.y += window.scrollY
    this.initialPos.y = this.mesh.position.y
  }

  updateScrollValues(scrollY) {
    this.newPosY =
      this.initialPos.y +
      (scrollY / this.document.scrollableHeight) *
        (this.document.bodyHeight - this.document.windowHeight)

    // Update the plane's Y position
    // if (!this.isMoving)
    this.mesh.position.setY(this.newPosY)

    // if (!this.isMoving && this.plane) {
    //   gsap.to(this.plane.position, {
    //     y: this.newPosY,
    //     // overwrite: true,
    //     duration: 0.25,
    //   })
    // }
  }

  onMouseClick() {
    this.isMoving = true

    // this.stage.hideOtherPlanes(this.index)edge
    console.log(
      '🚀 ~ file: PlaneProject.js:118 ~ PlaneProject ~ onMouseClick ~ this.index:',
      this.index
    )

    const initialWidth = this.mesh.scale.x
    const initialHeight = this.mesh.scale.y

    const container = document.querySelector('.container-huge').getBoundingClientRect()
    // const aspectRatio = this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight

    const scaleX = (container.width - window.innerWidth * 0.25) / initialWidth

    // Calculate offset
    const heightAfterScale = initialHeight * scaleX
    const widthAfterScale = initialWidth * scaleX

    const navbarHeight = document.querySelector('.nav').getBoundingClientRect().height
    const offsetY = window.innerHeight / 2 - heightAfterScale / 2 - navbarHeight
    // const offsetX =
    //   window.innerWidth / 2 - widthAfterScale / 2 - (window.innerWidth - container.right)
    const offsetX = Math.abs(window.innerWidth / 2 - widthAfterScale / 2 - container.left)

    const targetPosition = { x: -offsetX, y: offsetY, z: this.mesh.position.z }
    const screenCenter = { x: 0, y: 0, z: this.mesh.position.z }

    const scale_duration = 1.25
    const ease = CustomEase.create(
      'custom',
      'M0,0,C0.426,-0.01,0.422,0.572,0.54,0.76,0.64,0.946,0.818,1.001,1,1'
    )

    if (this.clickedTimeline) this.clickTimeline.kill()

    this.clickTimeline = gsap.timeline({ paused: true })

    // Use GSAP to tween the plane's position and scale
    console.log('PLANE: ', this.mesh)
    this.clickTimeline.to(
      this.mesh.position,
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
          //   this.initialPos.copy(this.plane.position)
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
      this.mesh.position,
      {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: scale_duration,
        // overwrite: true,
        ease: ease,
        onComplete: () => {
          this.onPositionUpdate.bind(this)
          //   this.initialPos.copy(this.plane.position)
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

  onMouseOver(index) {
    console.log('onMouseOver')
    if (this.isMoving) return
    if (!this.isLoaded) return
    this.onMouseEnter()
    if (this.currentItem && this.currentItem.index === index) return
    this.onTargetChange(index)
  }

  onMouseEnter() {
    console.log('onMouseEnter')
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

  onMouseLeave() {
    console.log('onMouseLeave')
    if (this.isMoving) return
    gsap.to(this.uniforms.uAlpha, {
      value: 0,
      ease: 'power4.out',
      duration: 0.5,
    })
  }

  onMouseMove() {
    console.log('onMouseMove')
    if (this.isMoving) return

    this.uniforms.mousePos.value.copy(this.mouseNormal)

    this.position = new THREE.Vector3(this.mouseMapped.x, this.mouseMapped.y, 0)

    this.mouseOverAnimation = gsap.to(this.mesh.position, {
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
      this.initialPos.y = this.mesh.position.y - this.scrollY
      // This works but when the mesh stops moving before scroll

      let offset = this.mesh.position.clone().sub(this.position)
      this.currentOffset = offset

      this.currentOffset.x = this.currentOffset.x / (window.innerWidth / 2)
      this.currentOffset.y = this.currentOffset.y / (window.innerHeight / 2)

      this.uniforms.uOffset.value = this.currentOffset
    }
  }

  onTargetChange() {
    if (this.isMoving) return

    // Reset uniform values
    this.uniforms.progress.value = 0
    this.uniforms.scale.value = this.initialScale

    // item target changed
    if (!this.item.texture) {
      console.log('There is no texture')
      return
    }

    // compute image ratio
    let imageRatio = this.item.img.naturalWidth / this.item.img.naturalHeight
    // let imageRatio = this.currentItem.img.naturalHeight / this.currentItem.img.naturalWidth
    let bounds = {
      width: this.item.img.naturalWidth,
      height: this.item.img.naturalHeight,
    }
    this.uniforms.aspectRatio.value = imageRatio
    this.scale = new THREE.Vector3(imageRatio, 1, 1)
    this.uniforms.uTexture.value = this.item.texture
    // this.plane.scale.copy(this.scale)
    this.mesh.scale.set(bounds.width, bounds.height, 1)
  }

  createEventsListeners() {
    // if (window.onMouseOver) {
    //   window.removeEventListener('mouseover', window.onMouseOver)
    // }

    // this.item.element.addEventListener('mouseover', this.onMouseOver.bind(this), false)
    this.item.element.addEventListener('click', this.onMouseClick.bind(this))

    // this.item.element.addEventListener('mousemove', this.onMouseMove.bind(this), false)

    // Event listener for items wrapper
    // this.item.element.addEventListener('mouseleave', this.onMouseLeave.bind(this), false)
  }

  get document() {
    let contentHeight = document.body.offsetHeight
    let bodyHeight = document.body.scrollHeight
    let windowHeight = window.innerHeight
    let scrollableHeight = bodyHeight - windowHeight

    return {
      contentHeight,
      bodyHeight,
      windowHeight,
      scrollableHeight,
    }
  }
}
