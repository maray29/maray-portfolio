import gsap from 'gsap'
import * as THREE from 'three'

import fragmentShader from './shaders/sphereFragmentShader.glsl'
import vertexShader from './shaders/sphereVertexShader.glsl'
import noise from './shaders/Noise.glsl'
import { textureLoader } from './loaders'

export default class Sphere extends THREE.Object3D {
  constructor(stage, options = {}) {
    super()
    this.stage = stage
    this.options = options
    this.options.strength = options.strength || 0.25
    this.options.transparent = options.transparent ? 0.0 : 1.0
    this.initialScale = options.scale || 300
    this.noiseSpeed = options.noiseSpeed || 0.5
    this.rotationSpeed = options.rotationSpeed || 0.5

    this.mouseMapped = new THREE.Vector2()
    this.mouseNormal = new THREE.Vector2()

    this.init()
  }

  async init() {
    this.#createSphereMesh()
    // this.stage.scene.add(this.sphere)
  }

  #createSphereMesh() {
    this.geometry = new THREE.IcosahedronGeometry(1, 60)
    // this.geometrySphere = new THREE.SphereGeometry(400, 100, 100)

    // const map = textureLoader.load('./src/images/circle.png')
    // const texture = new THREE.Texture(map)
    // console.log('texture:', texture)

    // this.material = new THREE.PointsMaterial({
    //   // size: 5,
    //   // map: this.dot(),
    //   // map: map,
    //   blending: THREE.AdditiveBlending,
    //   color: 0x101a88,
    //   depthTest: false,
    //   transparent: true,
    // })

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x101a88) },
        time: { value: 0 },
        speed: { value: this.noiseSpeed },
        radius: { value: 1 },
        particleSizeMin: { value: 6 },
        particleSizeMax: { value: 12 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // Enable custom blending
    })

    this.mesh = new THREE.Points(this.geometry, this.material)
    this.mesh.scale.multiplyScalar(this.initialScale)
    // this.mesh.position.z = -3000

    this.geometry2 = new THREE.IcosahedronGeometry(1, 40)
    this.material2 = new THREE.MeshBasicMaterial({ color: 0xffffff })
    // this.material2.wireframe = true

    this.meshSphere = new THREE.Mesh(this.geometry2, this.material)
    this.meshSphere.scale.multiplyScalar(this.initialScale)
    this.meshSphere.position.z = -3000
    this.mesh.position.y += window.scrollY

    this.stage.scene.add(this.mesh)
    // this.stage.scene.add(this.meshSphere)
  }

  dot(size = 32, color = '#FFFFFF') {
    const sizeH = size * 0.5

    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size

    const ctx = canvas.getContext('2d')

    const circle = new Path2D()
    circle.arc(sizeH, sizeH, sizeH, 0, 2 * Math.PI)

    ctx.fillStyle = color
    ctx.fill(circle)

    // debug canvas
    canvas.style.position = 'fixed'
    canvas.style.top = 0
    canvas.style.left = 0
    document.body.appendChild(canvas)

    return new THREE.CanvasTexture(canvas)
  }

  setupShader(material) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.time = { value: 0 }
      shader.uniforms.radius = { value: 1 }
      shader.uniforms.particleSizeMin = { value: 5 }
      shader.uniforms.particleSizeMax = { value: 10 }
      shader.vertexShader = 'uniform float particleSizeMax;\n' + shader.vertexShader
      shader.vertexShader = 'uniform float particleSizeMin;\n' + shader.vertexShader
      shader.vertexShader = 'uniform float radius;\n' + shader.vertexShader
      shader.vertexShader = 'uniform float time;\n' + shader.vertexShader
      shader.vertexShader = noise + '\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
          vec3 p = position;
          float n = snoise( vec3( p.x*.6 + time*0.6, p.y*0.4 + time*0.9, p.z*.2 + time*0.6) );
          p += n *0.4;

          // constrain to sphere radius
          float l = radius / length(p);
          p *= l;
          float s = mix(particleSizeMin, particleSizeMax, n);
          vec3 transformed = vec3( p.x, p.y, p.z );
        `
      )
      shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', 'gl_PointSize = s;')

      material.userData.shader = shader
    }
  }

  animateSphere(time) {
    this.mesh.rotation.set(0, time * this.rotationSpeed * 10, 0)
    // if (this.material.userData.shader) this.material.userData.shader.uniforms.time.value = time
    this.material.uniforms.time.value = time
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
