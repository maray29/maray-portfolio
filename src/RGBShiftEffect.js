import './utils/math';

import gsap from 'gsap';
import * as THREE from 'three';

import EffectShell from './EffectShell.js';

export class RGBShiftEffect extends EffectShell {
  constructor(
    container = document.querySelector('.canvas-container'),
    itemsWrapper = null,
    options = {}
  ) {
    super(container, itemsWrapper);
    if (!this.container || !this.itemsWrapper) return;

    options.strength = options.strength || 0.25;
    this.options = options;

    this.init();

    this.isMoving = false;
  }

  init() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
    // Plane size
    this.geometry = new THREE.PlaneBufferGeometry(2, 2, 32, 32);
    this.uniforms = {
      uTime: {
        value: 0,
      },
      uTexture: {
        value: null,
      },
      uOffset: {
        value: new THREE.Vector2(0.0, 0.0),
      },
      uAlpha: {
        value: 0,
      },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
          uniform vec2 uOffset;
          varying vec2 vUv;
          vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
            float M_PI = 3.1415926535897932384626433832795;
            position.x = position.x + (sin(uv.y * M_PI) * offset.x);
            position.y = position.y + (sin(uv.x * M_PI) * offset.y);
            return position;
          }
          void main() {
            vUv = uv;
            vec3 newPosition = position;
            newPosition = deformationCurve(position,uv,uOffset);
            gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
          }
        `,
      fragmentShader: `
          uniform sampler2D uTexture;
          uniform float uAlpha;
          uniform vec2 uOffset;
          varying vec2 vUv;
          vec3 rgbShift(sampler2D texture1, vec2 uv, vec2 offset) {
            float r = texture2D(uTexture,vUv + uOffset).r;
            vec2 gb = texture2D(uTexture,vUv).gb;
            return vec3(r,gb);
          }
          void main() {
            vec3 color = rgbShift(uTexture,vUv,uOffset);
            gl_FragColor = vec4(color,uAlpha);
          }
        `,
      transparent: true,
    });
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  onMouseClick(event) {
    console.log('clicked');

    this.isMoving = true;

    const planeMargin = 50;

    // Move the plane to the center of the screen
    const centerX = 0;
    const centerY = 0;

    this.position = new THREE.Vector3(centerX, centerY, 0);

    // Define the target position and scale
    const targetPosition = { x: 0, y: 0, z: this.plane.position.z };

    const cameraZ = this.camera.position.z;
    const distance = cameraZ - this.plane.position.z;
    const vFov = (this.camera.fov * Math.PI) / 180;
    const viewportHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const viewportWidthAtDistance = 2 * Math.tan(hFov / 2) * distance;

    const initialWidth = this.plane.geometry.parameters.width * this.plane.scale.x;
    const initialHeight = this.plane.geometry.parameters.height * this.plane.scale.y;

    const scaleX = viewportWidthAtDistance / initialWidth;
    const scaleY = viewportHeightAtDistance / initialHeight;

    const scaleFactor = Math.min(scaleX, scaleY);

    // this.plane.scale.set(scaleFactor * this.plane.scale.x, scaleFactor * this.plane.scale.y, 1);

    // Use GSAP to tween the plane's position and scale
    gsap.to(this.plane.position, {
      duration: 1,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      onUpdate: this.onPositionUpdate.bind(this),
      onComplete: () => {
        this.isMoving = false;
      },
    });
    gsap.to(this.plane.scale, {
      duration: 1,
      x: scaleFactor * this.plane.scale.x * 0.8,
      y: scaleFactor * this.plane.scale.y * 0.8,
      z: 1,
      onUpdate: () => {
        // console.log(scaleX, scaleY);
      },
    });

    // this.animationValues = {
    //   x: this.plane.position.x,
    //   y: this.plane.position.y,
    //   scale: this.plane.scale,
    // };

    // gsap.to(this.animationValues, {
    //   x: centerX,
    //   y: centerY,
    //   scale: 3,
    //   onUpdate: () => {
    //     this.plane.position.set(this.animationValues.x, this.animationValues.y, 1);
    //     this.plane.scale.set(this.animationValues.scale);
    //   },
    //   onComplete: () => {
    //     this.isMoving = false;
    //   },
    // });

    // gsap.to(animationValues, {
    //   x: centerX,
    //   y: centerY,
    //   onUpdate: this.onPositionUpdate.bind(this),
    //   onComplete: () => {
    //     this.isMoving = false;
    //   },
    // });

    // this.plane.position.set(centerX, centerY, this.plane.position.z);

    // Scale the plane to fit the viewport with margins
    // this.plane.scale.set(targetScaleX, targetScaleY, 1);
  }

  onMouseEnter() {
    if (!this.isMoving) {
      if (!this.currentItem || !this.isMouseOver) {
        this.isMouseOver = true;
        // show plane
        gsap.to(this.uniforms.uAlpha, {
          value: 1,
          ease: 'power4.out',
          duration: 0.5,
        });
      }
    }
  }

  onMouseLeave(event) {
    if (!this.isMoving) {
      gsap.to(this.uniforms.uAlpha, {
        value: 0,
        ease: 'power4.out',
        duration: 0.5,
      });
    }
  }

  onMouseMove(event) {
    if (!this.isMoving) {
      // project mouse position to world coodinates
      let x = this.mouse.x.map(-1, 1, -this.viewSize.width / 2, this.viewSize.width / 2);
      let y = this.mouse.y.map(-1, 1, -this.viewSize.height / 2, this.viewSize.height / 2);

      this.position = new THREE.Vector3(x, y, 0);
      gsap.to(this.plane.position, {
        x: x,
        y: y,
        ease: 'power4.out',
        duration: 1,
        onUpdate: this.onPositionUpdate.bind(this),
      });
    }

    // console.log(this.plane.position);
  }

  onPositionUpdate() {
    // compute offset
    let offset = this.plane.position
      .clone()
      .sub(this.position)
      .multiplyScalar(-this.options.strength);
    this.uniforms.uOffset.value = offset;
  }

  onMouseOver(index, e) {
    if (!this.isMoving) {
      if (!this.isLoaded) return;
      this.onMouseEnter();
      if (this.currentItem && this.currentItem.index === index) return;
      this.onTargetChange(index);
    }
  }

  onTargetChange(index) {
    if (!this.isMoving) {
      // item target changed
      this.currentItem = this.items[index];
      if (!this.currentItem.texture) return;

      // compute image ratio
      let imageRatio = this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight;
      this.scale = new THREE.Vector3(imageRatio, 1, 1);
      this.uniforms.uTexture.value = this.currentItem.texture;
      this.plane.scale.copy(this.scale);
    }
  }
}
