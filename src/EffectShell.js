import * as THREE from 'three';

export default class EffectShell {
  constructor(container = document.body, itemsWrapper = null) {
    this.container = container;
    // vars from 3js course
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.itemsWrapper = itemsWrapper;
    if (!this.container || !this.itemsWrapper) return;

    this.setup();
    this.initEffectShell().then(() => {
      // console.log("load finished");
      this.isLoaded = true;
      if (this.isMouseOver) this.onMouseOver(this.tempItemIndex);
      this.tempItemIndex = null;
    });
    this.createEventsListeners();
    // this.barba();

    let pageID;
    let text;
  }

  setup() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    // window.addEventListener("scroll", this.onScroll.bind(this), false);

    // camera from 3js course
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 0.1, 1000);
    this.camera.fov = (2 * Math.atan(this.height / 2 / 600) * 180) / Math.PI;

    this.camera.position.z = 3;

    // this.camera.lookAt(this.container.position);

    // this.camera.position.z = 3;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    // scene
    this.scene = new THREE.Scene();

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // Set size?
    this.renderer.setSize(this.width, this.height);

    // this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    //mouse
    this.mouse = new THREE.Vector2();

    // time
    this.timeSpeed = 2;
    this.time = 0;
    this.clock = new THREE.Clock();

    // animation loop
    this.renderer.setAnimationLoop(this.render.bind(this));
    // requestAnimationFrame(this.render.bind(this));
  }

  render() {
    // called every frame
    this.time += this.clock.getDelta() * this.timeSpeed;
    this.renderer.render(this.scene, this.camera);
    // this.renderer.setAnimationLoop(this.render.bind(this));
  }

  initEffectShell() {
    let promises = [];

    this.items = this.itemsElements;

    const THREEtextureLoader = new THREE.TextureLoader();
    this.items.forEach((item, index) => {
      // create textures
      promises.push(this.loadTexture(THREEtextureLoader, item.img ? item.img.src : null, index));
    });

    return new Promise((resolve, reject) => {
      // resolve textures promises
      Promise.all(promises).then((promises) => {
        // all textures are loaded
        promises.forEach((promise, index) => {
          // assign texture to item
          this.items[index].texture = promise.texture;
        });
        resolve();
      });
    });
  }

  createEventsListeners() {
    if (window.onMouseOver) {
      window.removeEventListener('mouseover', window.onMouseOver);
    }

    this.items.forEach((item, index) => {
      console.log(item);
      // console.log("Adding an event listener for each item.");
      item.element.addEventListener('mouseover', this._onMouseOver.bind(this, index), false);
      item.element.addEventListener('click', this._onMouseClick.bind(this));
    });

    this.itemsWrapper.addEventListener('mousemove', this._onMouseMove.bind(this), false);

    // Event listener for items wrapper
    this.itemsWrapper.addEventListener('mouseleave', this._onMouseLeave.bind(this), false);
  }

  _onMouseClick(event) {
    event.preventDefault();
    this.onMouseClick(event);
  }

  _onMouseLeave(event) {
    this.isMouseOver = false;
    this.onMouseLeave(event);
    // console.log("_onMouseLeave");
  }

  _onMouseMove(event) {
    // get normalized mouse position on viewport - it's not running
    this.mouse.x = (event.clientX / this.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.height) * 2 + 1;

    this.onMouseMove(event);

    // console.log("_onMouseMove");
  }

  _onMouseOver(index, event) {
    this.tempItemIndex = index;
    this.onMouseOver(index, event);
    // console.log("_onMouseOver");
  }

  onWindowResize() {
    // Code from three.js course
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.camera.fov = (2 * Math.atan(this.height / 2 / 600) * 180) / Math.PI;

    // Original code
    // this.camera.aspect = this.viewport.aspectRatio;
    // this.camera.updateProjectionMatrix();
    // this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  onUpdate() {}

  onMouseClick(event) {}

  onMouseEnter(event) {}

  onMouseLeave(event) {}

  onMouseMove(event) {}

  onMouseOver(index, event) {}

  get viewport() {
    let width = this.container.offsetWidth;
    let height = this.container.offsetHeight;
    let aspectRatio = width / height;
    return {
      width,
      height,
      aspectRatio,
    };
  }

  get viewSize() {
    // fit plane to screen
    // https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f

    let distance = this.camera.position.z;
    let vFov = (this.camera.fov * Math.PI) / 180;
    let height = 2 * Math.tan(vFov / 2) * distance;
    let width = height * this.viewport.aspectRatio;
    return { width, height, vFov };
  }

  get itemsElements() {
    // convert NodeList to Array
    const items = [...this.itemsWrapper.querySelectorAll('.project_link')];

    //debug
    // console.log(items);
    //create Array of items including element, image and index
    return items.map((item, index) => ({
      element: item,
      img: item.querySelector('img') || null,
      index: index,
      // console: console.log(item.querySelector("img"))
    }));
  }

  loadTexture(loader, url, index) {
    // https://threejs.org/docs/#api/en/loaders/TextureLoader
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve({ texture: null, index });
        return;
      }
      // load a resource
      loader.load(
        // resource URL
        url,

        // onLoad callback
        (texture) => {
          resolve({ texture, index });
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        (error) => {
          // console.error("An error happened.", error);
          reject(error);
        }
      );
    });
  }
}
