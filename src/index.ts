import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

import { RGBShiftEffect } from './RGBShiftEffect.js';

gsap.registerPlugin(ScrollTrigger);

window.Webflow ||= [];
window.Webflow.push(() => {
  const container = document.querySelector('.canvas-container');
  const itemsWrapper = document.querySelector('.projects_list');

  new RGBShiftEffect(container, itemsWrapper, {
    strength: 0.25,
  });

  let splitText;
  let lines;

  function runSplit() {
    const currentElement = document.querySelectorAll('.process_text');

    splitText = new SplitType(currentElement, { types: 'lines, chars' });

    // lines = document.querySelectorAll(".line");
    lines = splitText.lines;

    lines.forEach((line) => {
      const lineMask = document.createElement('div');
      lineMask.classList.add('line-mask');
      line.append(lineMask);
    });
  }

  runSplit();

  window.addEventListener('resize', function () {
    splitText.revert();
    runSplit();
  });

  function lineMaskAnimation() {
    gsap.registerPlugin(ScrollTrigger);
    lines.forEach((line) => {
      const triggerElement = line;
      const targetElement = line.querySelector('.line-mask');
      // console.log(triggerElement);

      gsap.to(targetElement, {
        width: '0%',
        duration: 3,
        scrollTrigger: {
          trigger: triggerElement,
          start: 'top center',
          end: '+=400',
          scrub: 1,
        },
      });
    });
  }

  lineMaskAnimation();

  let bodyScrollPosition = 0;

  function getScrollPosition() {
    bodyScrollPosition = $(window).scrollTop();
  }

  function updateScroll(position = 0) {
    $(window).scrollTop(position);
  }

  let text;
  let description;

  function runSplit2() {
    // Split text into words and characters
    text = new SplitType('.home_heading', { types: 'lines, words, chars' });
    // description = new SplitType(".portfolio-header_description", {
    //   types: "lines, words, chars"
    // });
  }
  const logo = document.querySelector('.nav1_logo-link');
  const contactLink = document.querySelector('.nav1_contact');

  function animateHeading() {
    // Animate characters into view with a stagger effect

    // gsap.set(".home_heading", { visibility: "visible" });

    const headerTl = gsap.timeline();

    headerTl.set('.page-wrapper', { visibility: 'visible' });
    headerTl.set('.page-wrapper', {
      autoalpha: 1,
    });

    // Animate characters into view with a stagger effect
    headerTl.from(text.chars, {
      duration: 1,
      autoAlpha: 0,
      yPercent: 150,
      stagger: 0.01,
      ease: 'expo.out',
    });

    headerTl.from(
      logo,
      {
        opacity: 0,
        duration: 0.75,
      },
      '<0.85'
    );

    headerTl.from(
      contactLink,
      {
        opacity: 0,
        duration: 0.5,
      },
      '<0.5'
    );
  }

  runSplit2();
  animateHeading();

  // Prevent reloading the same page
  // const links = document.querySelectorAll('a[href]');
  // const cbk = function (e) {
  //   if (e.currentTarget.href === window.location.href) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  // };

  // for (let i = 0; i < links.length; i++) {
  //   links[i].addEventListener('click', cbk);
  // }

  const transitionDuration = 0.75;
  const transitionY = '20vh';

  // barba.init({
  //   transitions: [
  //     {
  //       sync: false,
  //       name: 'from-home-transition',
  //       from: {
  //         namespace: ['home'],
  //       },
  //       beforeLeave: function (data) {
  //         document.querySelector('.canvas-container').style.opacity = '0';
  //       },
  //       leave(data) {
  //         getScrollPosition();
  //         // console.log(bodyScrollPosition);
  //         return gsap.timeline().to(data.current.container, {
  //           opacity: 0,
  //           duration: transitionDuration,
  //           y: transitionY,
  //           onComplete: () => {
  //             document.querySelector('.canvas-container').style.visibility = 'hidden';
  //           },
  //         });
  //       },
  //       beforeEnter: function (data) {
  //         updateScroll(0);
  //       },
  //       enter: (data) => {
  //         gsap.timeline().from(data.next.container, {
  //           opacity: 0,
  //           duration: transitionDuration,
  //           y: transitionY,
  //         });
  //       },
  //       after: function (data) {
  //         // animateCursor();
  //       },
  //     },
  //     {
  //       name: 'from-inside-page-transition',
  //       from: {
  //         namespace: ['inside'],
  //       },
  //       leave(data) {
  //         return gsap.timeline().to(data.current.container, {
  //           opacity: 0,
  //           y: transitionY,
  //           duration: transitionDuration,
  //         });
  //       },
  //       enter: (data) => {
  //         updateScroll(bodyScrollPosition);
  //         runSplit2();
  //         gsap.timeline().from(data.next.container, {
  //           opacity: 0,
  //           y: transitionY,
  //           duration: transitionDuration,
  //           onComplete: () => {
  //             document.querySelector('.canvas-container').style.opacity = '1';
  //             document.querySelector('.canvas-container').style.visibility = 'visible';
  //           },
  //         });
  //       },
  //       after: function (data) {
  //         animateHeading();

  //         document.querySelector('.canvas-container canvas').remove();
  //         effect();

  //         // Line mask animation
  //         runSplit();
  //         lineMaskAnimation();
  //       },
  //       afterEnter: function (data) {
  //         window.Webflow.destroy();
  //         window.Webflow.ready();
  //         window.Webflow.require('ix2').init();
  //       },
  //     },
  //   ],
  // });

  // window.addEventListener('touchstart', () => {
  //   document.querySelector('.cursor').style.visibility = 'hidden';
  //   document.querySelector('.cursor-2').style.visibility = 'hidden';
  // });
});
