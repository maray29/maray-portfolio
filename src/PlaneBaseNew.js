import './utils/math'

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import * as THREE from 'three'

// import PlaneBase from './PlaneBase.js'
import fragmentShader from './shaders/fragmentShader.glsl'
import vertexShader from './shaders/vertexShader.glsl'
import { doc } from 'prettier'

gsap.registerPlugin(CustomEase)

export default class PlaneBaseNew {
  constructor(itemsWrapper, stage, options = {}) {
    this.itemsWrapper = itemsWrapper
    this.stage = stage
    this.options = options
    this.options.strength = options.strength || 0.25
    this.options.transparent = options.transparent ? 0.0 : 1.0

    this.isMoving = false

    this.mouse = new THREE.Vector2()
    this.mouseMapped = new THREE.Vector2()
    this.mouseNormal = new THREE.Vector2()

    this.currentOffset = 0

    this.initialPos = new THREE.Vector3(0, 0, 0)

    this.scrollY = 0
    this.isScrolling = false

    this.initialScale = 1.0

    // this.currentItem = this.items[0]

    // setTimeout(() => {
    //   console.log('Delayed current item texture:', this.currentItem.texture)
    //   this.init()
    // }, 1000)

    this.initializeAndInit()
  }

  async initializeAndInit() {
    await this.initPlaneBase()
    this.currentItem = this.items[0]
    this.isLoaded = true
    this._setMesh()
    this._setPlaneScale()
    this._setPlanePosition()
    this.stage.scene.add(this.plane)
    this.createEventsListeners()
  }

  async initPlaneBase() {
    let promises = []

    this.items = this.itemsElements

    const THREEtextureLoader = new THREE.TextureLoader()
    THREE.Cache.enabled = true
    this.items.forEach((item, index) => {
      // create textures
      promises.push(
        this.stage.loadTexture(THREEtextureLoader, item.img ? item.img.src : null, index)
      )
    })

    return new Promise((resolve, reject) => {
      // resolve textures promises
      Promise.all(promises).then((promises) => {
        // all textures are loaded
        promises.forEach((promise, index) => {
          // assign texture to item
          this.items[index].texture = promise.texture
        })
        resolve()
      })
    })
  }

  _setMesh() {
    const containerHuge = document.querySelector('.container-huge')
    const rect = containerHuge.getBoundingClientRect()

    // console.log('items:', this.items)
    // console.log('current item:', this.currentItem)
    // console.log('current item img:', this.currentItem.img)
    // console.log('current item texture:', this.currentItem.texture)
    // console.log('current item img width:', this.currentItem.img.naturalWidth)
    // console.log('this.itemBounds:', this.itemBounds)

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
        value: this.options.transparent,
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
  }

  _setPlanePosition() {
    this.plane.position.set(0, 0, 0)
  }

  _setPlaneScale() {
    this.itemBounds = {
      width: this.currentItem.img.naturalWidth,
      height: this.currentItem.img.naturalHeight,
    }
    this.plane.scale.set(this.itemBounds.width, this.itemBounds.height, 1)
  }

  // _setPlane() {
  //   this.currentItem = this.items[0]
  //   this.uniforms.uTexture.value = this.currentItem.texture
  //   gsap.to(this.plane.position, {
  //     x: 0,
  //     y: 0,
  //   })
  //   gsap.to(this.uniforms.uAlpha, {
  //     value: 1,
  //     ease: 'power4.out',
  //     duration: 0.5,
  //   })
  // }

  updateScrollValues(x, scrollY) {
    this.newPosY =
      this.initialPos.y +
      (scrollY / this.document.scrollableHeight) *
        (this.document.bodyHeight - this.document.windowHeight)

    // Update the plane's Y position
    // if (!this.isMoving) this.plane.position.setY(this.newPosY)

    if (!this.isMoving && this.plane) {
      gsap.to(this.plane.position, {
        y: this.newPosY,
        // overwrite: true,
        duration: 0.25,
      })
    }
  }

  _onMouseClick(event) {
    // event.preventDefault();
    this.onMouseClick(event)
  }

  _onMouseLeave(event) {
    this.isMouseOver = false
    this.onMouseLeave(event)
  }

  _onMouseMove(event) {
    event.preventDefault()
    // get normalized mouse position on viewport
    this.mouse.x = (event.clientX / this.stage.viewSize.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.stage.viewSize.height) * 2 + 1

    this.mouseMapped.x = event.clientX - this.stage.viewSize.width / 2
    this.mouseMapped.y = -(event.clientY - this.stage.viewSize.height / 2)

    this.mouseNormal.x = event.clientX
    this.mouseNormal.y = event.clientY

    // this.stage.postFXMesh.material.uniforms.mousePos.value.set(this.mouse.x, this.mouse.y)
    this.stage.mouseTargetPos.x = this.mouse.x
    this.stage.mouseTargetPos.y = this.mouse.y

    this.onMouseMove(event)
  }

  _onMouseOver(index, event) {
    this.tempItemIndex = index
    this.onMouseOver(index, event)
  }

  _onWheel() {
    this.onWheel()
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

  get itemsElements() {
    // convert NodeList to Array
    const items = [...this.itemsWrapper.children]

    // create Array of items including element, image and index
    return items.map((item, index) => ({
      element: item,
      img: item.querySelector('img') || null,
      index: index,
    }))
  }

  createEventsListeners() {
    if (window.onMouseOver) {
      window.removeEventListener('mouseover', window.onMouseOver)
    }

    this.items.forEach((item, index) => {
      item.element.addEventListener('mouseover', this._onMouseOver.bind(this, index), false)
      item.element.addEventListener('click', this._onMouseClick.bind(this))
    })

    this.itemsWrapper.addEventListener('mousemove', this._onMouseMove.bind(this), false)

    // Event listener for items wrapper
    this.itemsWrapper.addEventListener('mouseleave', this._onMouseLeave.bind(this), false)
  }

  onWheel() {}

  onMouseClick(event) {}

  onMouseEnter(event) {}

  onMouseLeave(event) {}

  onMouseMove(event) {}

  onMouseOver(index, event) {}
}
