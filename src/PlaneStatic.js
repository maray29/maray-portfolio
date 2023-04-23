import PlaneBaseNew from './PlaneBaseNew.js'

export default class PlaneStatic extends PlaneBaseNew {
  constructor(itemsWrapper, stage, options = { transparent: false }) {
    super(itemsWrapper, stage, options)
    // this.initializeAndInit()
  }

  //   async initializeAndInit() {
  //     await this.initPlaneBase()
  //     this.currentItem = this.items[0]
  //     this.isLoaded = true
  //     this._setMesh()
  //     this._setPlanePosition()
  //     this._setPlaneScale()
  //     this.stage.scene.add(this.plane)
  //     this.createEventsListeners()
  //     // console.log('Plane:', this.plane)
  //   }

  _setPlanePosition() {
    // Calculate top offset and replace hard coded value
    const imgRect = this.currentItem.img.getBoundingClientRect()
    const navbarHeight = document.querySelector('.nav').getBoundingClientRect().height
    const offsetY = window.innerHeight / 2 - this.plane.scale.y / 2 - navbarHeight
    const offsetX = Math.abs(window.innerWidth / 2 - this.plane.scale.x / 2 - imgRect.left)
    // console.log('offsetX:', offsetX)
    // console.log('plane.with:', this.plane.scale.x)
    this.plane.position.set(-offsetX, offsetY, 0)
    this.initialPos.y = this.plane.position.y
  }

  _setPlaneScale() {
    this.imgSize = this.currentItem.img.getBoundingClientRect()
    this.plane.scale.set(this.imgSize.width, this.imgSize.height, 1)
  }
}
