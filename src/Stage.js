import * as THREE from 'three'
import postFXvertex from './shaders/postFXvertexShader.glsl'
import postFXfragment from './shaders/postFXfragmentShader.glsl'
import gsap from 'gsap'
import Sphere from './Sphere.js'
import PlaneProject from './PlaneProject'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// define your constants here
const BOX_COLOR = 0xffffff
const CAMERA_FOV = 30
const NEAR = 0.1
const FAR = 10000

export default class Stage {
  constructor(container = document.body, opts = { physics: false, debug: false }) {
    this.container = container
    this.hasDebug = opts.debug
    this.planes = []
    this.#init()

    this.doc = this.document
  }

  async #init() {
    this.#setInitialParameters()
    this.#setupCamera()
    this.#setupScene()
    this.#setupRender()
    this.#setupPostFX()
    this.#createSphere()
    // this.#createLogoSymbol()
    this.#setupAnimationLoop()
    this.#addEventListeners()
    this.#createControls()

    if (this.hasDebug) {
      const { Debug } = await import('./Debug.js')
      new Debug(this)

      const { default: Stats } = await import('stats.js')
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
    }
  }

  async initPlanes(projectsList) {
    this.planes = []
    this.itemsWrapper = projectsList
    await this.initPlaneBase()

    this.items.forEach((item, index) => {
      const plane = new PlaneProject(item, this)
      plane.index = index
      this.scene.add(plane.mesh)
      // console.log(plane)

      this.planes.push(plane)
    })
  }

  async initPlaneBase() {
    let promises = []

    this.items = this.itemsElements

    const THREEtextureLoader = new THREE.TextureLoader()
    THREE.Cache.enabled = true
    this.items.forEach((item, index) => {
      // create textures
      promises.push(this.loadTexture(THREEtextureLoader, item.img ? item.img.src : null, index))
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

  hideOtherPlanes(i) {
    this.planes.forEach((plane, index) => {
      if (index !== i) {
        // plane.mesh.material.uniforms.uAlpha = 0.0
        console.log(plane)
        this.scene.remove(plane.mesh)
        // this.planes.splice(index)

        gsap.to(plane.mesh.material.uniforms.uAlpha, {
          value: 0,
          ease: 'power4.out',
          duration: 0.5,
        })
      } else {
        this.currentPlane = plane
        console.log('Current plane: ', this.currentPlane)
      }
    })
  }

  removeCurrentPlane() {
    this.scene.remove(this.currentPlane.mesh)
  }

  updateScrollValues(scrollY) {
    this.planes.forEach((plane) => {
      plane.updateScrollValues(scrollY)
    })
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

  #setInitialParameters() {
    this.renderParam = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }
    this.mouse = new THREE.Vector2()
    this.mouseTargetPos = new THREE.Vector2()
  }

  #createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 0, 15)
    this.initialControlPos = this.controls.target.clone()
    this.controls.update()
    this.controls.enabled = false
  }

  #createLogoSymbol() {
    // const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1)
    const width = 10
    const height = 100
    const geometry = new THREE.BoxGeometry(width, height, 1)
    const material = new THREE.MeshBasicMaterial({ color: BOX_COLOR })
    // material.wireframe = true
    this.logoSymbol = new THREE.Mesh(geometry, material)
    // this.shadedBox.scale.x = 100
    // this.shadedBox.scale.y = 100
    // this.shadedBox.scale.z = 100
    // this.shadedBox.position.x = -window.innerWidth / 2 + 160

    this.#setLogoSymbolPosition(this.logoSymbol)

    this.scene.add(this.logoSymbol)
  }

  animateSphere(x, scrollY) {
    this.newPosY =
      (scrollY / this.doc.scrollableHeight) * (this.doc.bodyHeight - this.doc.windowHeight)

    this.newScale = this.sphere.initialScale - scrollY * 1.75

    gsap.to(this.sphere.mesh.position, {
      y: this.newPosY,
      z: -this.newPosY,
      duration: 0.25,
    })
    if (this.newScale > 600) {
      gsap.to(this.sphere.mesh.scale, {
        x: this.newScale,
        y: this.newScale,
        z: this.newScale,
      })
    }

    // gsap.to(this.sphere.mesh.rotation, {
    //   y: this.newRotation,
    //   duration: 0.5,
    // })
    // console.log(this.sphere.mesh.rotation)

    // gsap.to(this.camera.position, {
    //   y: -this.newPosY,
    //   duration: 0.25,
    // })
  }

  #createSphere() {
    this.sphere = new Sphere(this, { scale: 300, noiseSpeed: 0.05, rotationSpeed: 0.05 })
    this.sphere.animateSphere(0, window.scrollY)
    console.log('window.scrollY: ', window.scrollY)

    // this.sphere2 = new Sphere(this, { scale: 300, noiseSpeed: 0.5, rotationSpeed: 0.4 })
    // console.log(this.sphere)
  }

  #setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      this.renderParam.width / this.renderParam.height,
      NEAR,
      FAR
    )
    this.camera.fov = (2 * Math.atan(this.renderParam.height / 2 / 2000) * 180) / Math.PI

    this.camera.position.z = 2000

    this.camera.aspect = this.renderParam.width / this.renderParam.height
    this.camera.updateProjectionMatrix()

    console.log(this.camera.fov)

    // let aspectRatio = this.renderParam.width / this.renderParam.height
    // let viewHeight = 1000
    // let viewWidth = aspectRatio * viewHeight

    // this.camera = new THREE.OrthographicCamera(
    //   -viewWidth / 2, // Left
    //   viewWidth / 2, // Right
    //   viewHeight / 2, // Top
    //   -viewHeight / 2, // Bottom
    //   0.01,
    //   10000
    // )

    // this.camera.position.z = 500

    // this.camera.updateProjectionMatrix()
  }

  #setupScene() {
    this.scene = new THREE.Scene()
  }

  #setupRender() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.container.appendChild(this.renderer.domElement)
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
    this.renderer.setClearColor(0x000000)
    // this.renderer.setClearColor(0x9c3737)
  }

  #setupPostFX() {
    // Create a new framebuffer we will use to render to
    // the video card memory
    this.renderBufferA = new THREE.WebGLRenderTarget(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    )

    // Create a second framebuffer
    this.renderBufferB = new THREE.WebGLRenderTarget(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    )

    // Create a second scene that will hold our fullscreen plane
    this.postFXScene = new THREE.Scene()

    // Create a plane geometry that covers the entire screen
    this.postFXGeometry = new THREE.PlaneGeometry(innerWidth, innerHeight)

    // Create a plane material that expects a sampler texture input
    // We will pass our generated framebuffer texture to it
    this.postFXMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sampler: { value: null },
        time: { value: 0 },
        mousePos: { value: this.mouse },
      },
      // vertex shader will be in charge of positioning our plane correctly
      vertexShader: postFXvertex,
      fragmentShader: postFXfragment,
      transparent: true,
    })
    this.postFXMesh = new THREE.Mesh(this.postFXGeometry, this.postFXMaterial)
    this.postFXScene.add(this.postFXMesh)
  }

  #setupAnimationLoop() {
    // time
    this.timeSpeed = 2
    this.time = 0
    this.clock = new THREE.Clock()

    this.stats?.begin()

    this.#update()

    this.stats?.end()
    // animation loop
    // this.renderer.setAnimationLoop(this.render.bind(this))
    gsap.ticker.add(this.render.bind(this))
  }

  #update() {}

  render() {
    // called every frame
    // this.time += this.clock.getDelta() * this.timeSpeed
    const elapsed = this.clock.getElapsedTime()
    // this.shadedBox.rotation.y = elapsed * 0.5
    // this.shadedBox.rotation.z = elapsed * 0.5
    this.sphere.animateSphere(elapsed)
    // this.sphere2.animateSphere(elapsed)

    // Update mouse position
    this.updateMousePosition()
    this.postFXMesh.material.uniforms.mousePos.value.copy(this.mouse)
    this.postFXMesh.material.uniforms.time.value = elapsed

    // Explicitly set renderBufferA as the framebuffer to render to
    // this.renderer.autoClearColor = false
    this.renderer.setRenderTarget(this.renderBufferA)

    this.renderer.render(this.postFXScene, this.camera)
    this.renderer.render(this.scene, this.camera)

    this.renderer.setRenderTarget(null)
    this.postFXMesh.material.uniforms.sampler.value = this.renderBufferA.texture
    this.renderer.render(this.postFXScene, this.camera)
    this.renderer.render(this.scene, this.camera)

    // Ping-pong our framebuffers by swapping them
    // at the end of each frame render
    const temp = this.renderBufferA
    this.renderBufferA = this.renderBufferB
    this.renderBufferB = temp
  }

  #addEventListeners() {
    window.addEventListener('resize', this.#onWindowResize.bind(this), false)
  }

  #onWindowResize() {
    this.doc = this.document
    // this.#setLogoSymbolPosition(this.logoSymbol)

    const { width, height } = this.viewport

    // Adjust renderer
    this.renderer.setSize(width, height)

    // Adjust camera
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.camera.fov = (2 * Math.atan(height / 2 / 600) * 180) / Math.PI

    // Adjust render buffers
    this.renderBufferA.dispose()
    this.renderBufferB.dispose()
    this.renderBufferA = new THREE.WebGLRenderTarget(
      width * window.devicePixelRatio,
      height * window.devicePixelRatio
    )
    this.renderBufferB = new THREE.WebGLRenderTarget(
      width * window.devicePixelRatio,
      height * window.devicePixelRatio
    )

    // Adjust postFX geometry
    this.postFXGeometry.dispose()
    this.postFXGeometry = new THREE.PlaneGeometry(width, height)

    // Replace geometry in postFX mesh
    this.postFXMesh.geometry = this.postFXGeometry
  }

  updateMousePosition() {
    const interpolationFactor = 0.001
    this.mouse.x += (this.mouseTargetPos.x - this.mouse.x) * interpolationFactor
    this.mouse.y += (this.mouseTargetPos.y - this.mouse.y) * interpolationFactor
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

  get viewport() {
    let width = this.container.offsetWidth
    let height = this.container.offsetHeight
    let aspectRatio = width / height
    return {
      width,
      height,
      aspectRatio,
    }
  }

  get viewSize() {
    // fit plane to screen
    // https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f

    let distance = this.camera.position.z
    let vFov = (this.camera.fov * Math.PI) / 180
    // let height = 2 * Math.tan(vFov / 2) * distance
    const height = 2 * Math.tan(vFov / 2) * distance
    let width = height * this.viewport.aspectRatio
    return { width, height, vFov }
  }

  // get cameraPos() {
  // Code here
  // }

  loadTexture(loader, url, index) {
    // https://threejs.org/docs/#api/en/loaders/TextureLoader

    return new Promise((resolve, reject) => {
      if (!url) {
        resolve({ texture: null, index })
        return
      }
      // load a resource
      loader.load(
        // resource URL
        url,

        // onLoad callback
        (texture) => {
          resolve({ texture, index })
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        (error) => {
          // console.error("An error happened.", error);
          reject(error)
        }
      )
    })
  }

  #setLogoSymbolPosition(logoSymbol) {
    const logo = document.querySelector('.logo')

    const logoRect = logo.getBoundingClientRect()
    const logoRight = logoRect.right
    const logoTop = logoRect.top
    const logoHeight = logoRect.height

    // this.shadedBox.position.x = -window.innerWidth / 2 + logoLeft - width / 2 - 10
    logoSymbol.position.x = -window.innerWidth / 2 + logoRight + 20
    logoSymbol.position.y = window.innerHeight / 2 - logoTop - logoHeight / 2

    logoSymbol.userData.offsetY = window.innerHeight / 2 - logoTop - logoHeight / 2
  }
}
