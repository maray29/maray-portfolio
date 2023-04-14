import './utils/math';

import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import * as THREE from 'three';

import EffectShell from './EffectShell.js';
import fragmentShader from './shaders/fragmentShader.glsl';
import vertexShader from './shaders/vertexShader.glsl';

gsap.registerPlugin(CustomEase);

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

    this.mouse = {
      x: 0,
      y: 0,
    };
    this.currentOffset;
  }

  init() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
    // Plane size
    this.geometry = new THREE.PlaneBufferGeometry(2, 2, 2000, 2000);
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
      uWarpFactor: {
        value: 0,
      },
      scale: {
        value: 0.5,
      },
      aspectRatio: {
        value: 0.5,
      },
      progress: { value: 0 }, // Start with progress = 0
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      // vertexShader: `
      //     uniform vec2 uOffset;
      //     varying vec2 vUv;
      //     vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
      //       float M_PI = 3.1415926535897932384626433832795;
      //       position.x = position.x + (sin(uv.y * M_PI) * offset.x);
      //       position.y = position.y + (sin(uv.x * M_PI) * offset.y);
      //       return position;
      //     }
      //     void main() {
      //       vUv = uv;
      //       vec3 newPosition = position;
      //       newPosition = deformationCurve(position,uv,uOffset);
      //       gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
      //     }
      //   `,
      // fragmentShader: `
      //     uniform sampler2D uTexture;
      //     uniform float uAlpha;
      //     uniform vec2 uOffset;
      //     varying vec2 vUv;
      //     vec3 rgbShift(sampler2D texture1, vec2 uv, vec2 offset) {
      //       float r = texture2D(uTexture,vUv + uOffset).r;
      //       vec2 gb = texture2D(uTexture,vUv).gb;
      //       return vec3(r,gb);
      //     }
      //     void main() {
      //       vec3 color = rgbShift(uTexture,vUv,uOffset);
      //       gl_FragColor = vec4(color,uAlpha);
      //     }
      //   `,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    });
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  onMouseClick(event) {
    this.isMoving = true;

    // Offset and progress values
    const animationValues = {
      x: this.currentOffset.x,
      y: this.currentOffset.y,
      progress: 0,
    };

    // Move the plane to the center of the screen
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

    const scale_duration = 1.25;
    // const ease = CustomEase.create(
    //   'custom',
    //   'M0,0,C0.29,0,0.498,0.49,0.606,0.766,0.66,0.89,0.78,1,1,1'
    // );
    const ease = CustomEase.create(
      'custom',
      'M0,0,C0.426,-0.01,0.422,0.572,0.54,0.76,0.64,0.946,0.818,1.001,1,1'
    );

    const clickTimeline = gsap.timeline();

    // Use GSAP to tween the plane's position and scale
    clickTimeline.to(
      this.plane.position,
      {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1,
        ease: CustomEase.create(
          'custom',
          'M0,0 C0.134,0.03 0.244,0.09 0.298,0.168 0.395,0.308 0.423,0.682 0.55,0.82 0.631,0.908 0.752,1 1,1 '
        ),
        onUpdate: this.onPositionUpdate.bind(this),
      },
      'start'
    );

    clickTimeline.to(
      this.uniforms.uOffset.value,
      {
        x: 0.0,
        y: 0.0,
      },
      'start'
    );

    clickTimeline.to(
      this.uniforms.progress,
      {
        value: 1.0,
        duration: scale_duration,
        ease: ease,
        onComplete: () => {
          this.isMoving = false;
        },
      },
      'scale'
    );

    clickTimeline.to(
      this.uniforms.scale,
      {
        value: scaleFactor * 0.8,
        duration: scale_duration,
        ease: ease,
      },
      'scale'
    );

    // clickTimeline.to(
    //   this.plane.scale,
    //   {
    //     duration: 2.5,
    //     x: scaleFactor * this.plane.scale.x * 0.8,
    //     y: scaleFactor * this.plane.scale.y * 0.8,
    //     z: 1,
    //     // ease: CustomEase.create(
    //     //   'custom',
    //     //   'M0,0 C0.134,0.03 0.244,0.09 0.298,0.168 0.395,0.308 0.423,0.682 0.55,0.82 0.631,0.908 0.752,1 1,1 '
    //     // ),
    //     ease: ease,
    //   },
    //   'scale'
    // );
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
      this.mouse.x = this.mouse.x.map(-1, 1, -this.viewSize.width / 2, this.viewSize.width / 2);
      this.mouse.y = this.mouse.y.map(-1, 1, -this.viewSize.height / 2, this.viewSize.height / 2);

      this.position = new THREE.Vector3(this.mouse.x, this.mouse.y, 0);
      gsap.to(this.plane.position, {
        x: this.mouse.x,
        y: this.mouse.y,
        ease: 'power4.out',
        duration: 1,
        onUpdate: this.onPositionUpdate.bind(this),
      });
    }
  }

  onPositionUpdate() {
    // compute offset
    if (!this.isMoving) {
      let offset = this.plane.position
        .clone()
        .sub(this.position)
        .multiplyScalar(-this.options.strength);
      this.currentOffset = offset;
      this.uniforms.uOffset.value = this.currentOffset;
    }
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
      // Reset uniform values
      this.uniforms.progress.value = 0;
      this.uniforms.scale.value = 0.5;

      // item target changed
      this.currentItem = this.items[index];
      if (!this.currentItem.texture) return;

      // compute image ratio
      let imageRatio = this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight;
      this.uniforms.aspectRatio.value = imageRatio;
      this.scale = new THREE.Vector3(imageRatio, 1, 1);
      this.uniforms.uTexture.value = this.currentItem.texture;
      this.plane.scale.copy(this.scale);
    }
  }
}
