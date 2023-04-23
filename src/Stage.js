import * as THREE from 'three'
import postFXvertex from './shaders/postFXvertexShader.glsl'
import postFXfragment from './shaders/postFXfragmentShader.glsl'
import verticalBlurFragmentShader from './shaders/verticalBlurFragmentShader.glsl'
import horizontalBlurFragmentShader from './shaders/horizontalBlurFragmentShader.glsl'

export default class Stage {
  constructor(container = document.body) {
    this.container = container
    this.renderParam = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }

    this.initialize()
  }

  initialize() {
    this.setup()

    this.isLoaded = true
    if (this.isMouseOver) this.onMouseOver(this.tempItemIndex)
    this.tempItemIndex = null
    // this.createEventsListeners()
  }

  setup() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false)

    this._setCamera()
    this._setScene()
    this._setRender()
    this._setPostFX()

    // mouse
    this.mouse = new THREE.Vector2()

    // time
    this.timeSpeed = 2
    this.time = 0
    this.clock = new THREE.Clock()

    // animation loop
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  _setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      30,
      this.renderParam.width / this.renderParam.height,
      0.1,
      1000
    )
    this.camera.fov = (2 * Math.atan(this.renderParam.height / 2 / 600) * 180) / Math.PI

    this.camera.position.z = 600

    this.camera.aspect = this.renderParam.width / this.renderParam.height
    this.camera.updateProjectionMatrix()
  }

  _setScene() {
    this.scene = new THREE.Scene()
  }

  _setRender() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)
  }

  _setPostFX() {
    // Create a new framebuffer we will use to render to
    // the video card memory
    this.renderBufferA = new THREE.WebGLRenderTarget(
      innerWidth * devicePixelRatio,
      innerHeight * devicePixelRatio
    )

    // Create a second framebuffer
    this.renderBufferB = new THREE.WebGLRenderTarget(
      innerWidth * devicePixelRatio,
      innerHeight * devicePixelRatio
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
        mousePos: { value: new THREE.Vector2(0, 0) },
      },
      // vertex shader will be in charge of positioning our plane correctly
      vertexShader: postFXvertex,
      fragmentShader: postFXfragment,
      transparent: true,
    })
    this.postFXMesh = new THREE.Mesh(this.postFXGeometry, this.postFXMaterial)
    this.postFXScene.add(this.postFXMesh)

    // Horizontal blur shader material
    this.horizontalBlurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sampler: { value: null },
        blurSize: { value: 1.0 / window.innerWidth }, // Adjust this value to control the blur amount
      },
      vertexShader: postFXvertex, // Reuse the vertex shader from your original setup
      fragmentShader: horizontalBlurFragmentShader, // Replace with the actual shader code for horizontal blur
    })

    // Vertical blur shader material
    this.verticalBlurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sampler: { value: null },
        blurSize: { value: 1.0 / window.innerHeight }, // Adjust this value to control the blur amount
      },
      vertexShader: postFXvertex, // Reuse the vertex shader from your original setup
      fragmentShader: verticalBlurFragmentShader, // Replace with the actual shader code for vertical blur
    })

    this.horizontalBlurMesh = new THREE.Mesh(this.postFXGeometry, this.horizontalBlurMaterial)
    this.verticalBlurMesh = new THREE.Mesh(this.postFXGeometry, this.verticalBlurMaterial)

    this.postFXScene.add(this.horizontalBlurMesh)
    this.postFXScene.add(this.verticalBlurMesh)
  }

  render() {
    // called every frame
    this.time += this.clock.getDelta() * this.timeSpeed
    // Explicitly set renderBufferA as the framebuffer to render to
    this.renderer.autoClearColor = false

    this.renderer.setRenderTarget(this.renderBufferA)

    this.renderer.render(this.postFXScene, this.camera)
    this.renderer.render(this.scene, this.camera)

    // Render the horizontal blur pass to renderBufferB using the texture from renderBufferA
    this.horizontalBlurMesh.material.uniforms.sampler.value = this.renderBufferA.texture
    this.renderer.setRenderTarget(this.renderBufferB)
    this.renderer.render(this.postFXScene, this.camera)
    this.renderer.render(this.horizontalBlurMesh, this.camera)

    // Render the vertical blur pass to the output framebuffer (null) using the texture from renderBufferB
    this.verticalBlurMesh.material.uniforms.sampler.value = this.renderBufferB.texture
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.postFXScene, this.camera)
    this.renderer.render(this.verticalBlurMesh, this.camera)

    // Assign the generated texture to the sampler variable used
    // in the postFXMesh that covers the device screen
    this.postFXMesh.material.uniforms.sampler.value = this.renderBufferA.texture

    this.renderer.render(this.postFXScene, this.camera)

    // Ping-pong our framebuffers by swapping them
    // at the end of each frame render
    const temp = this.renderBufferA
    this.renderBufferA = this.renderBufferB
    this.renderBufferB = temp
  }

  onWindowResize() {
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.camera.aspect = this.viewport.width / this.viewport.height
    this.camera.updateProjectionMatrix()

    this.camera.fov = (2 * Math.atan(this.viewport.height / 2 / 600) * 180) / Math.PI
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
}
