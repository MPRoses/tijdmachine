import React, { useEffect } from 'react';
import $ from 'jquery';
import { gsap } from 'gsap';
import anime from 'animejs';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';
import vid from "./vid.mp4";
import * as THREE from 'three';

import item1 from './event_1.png';
import item2 from './event_2.png';
import item3 from './event_3.png';

import faq1 from './faq1.png';
import faq2 from './faq2.png';
import faq3 from './faq3.png';
import faq4 from './faq4.png';
import faq5 from './faq5.png';
import faq6 from './faq6.png';
import faq7 from './faq7.png';
import faq8 from './faq8.png';

import contact from './contact.png';
import socials from './socials.png';
import Preloader from './Preload.js'

import vid2 from './Vid2.mp4'

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {

    function checkWidth() {
      var containerText = document.querySelector('.container-text');
      var texts = containerText.querySelectorAll('.text');
    
      texts.forEach(function(text) {
        if (window.innerWidth < 1000) {
          text.innerHTML = text.innerHTML.replace(/&nbsp;&nbsp;/g, '');
        } else {
          if (!text.innerHTML.includes('&nbsp;&nbsp;')) {
            text.innerHTML = text.innerHTML.replace(/TOP/g, '&nbsp;&nbsp;TOP');
          }
        }
      });
    }
    
    // Check width on initial load
    checkWidth();
    
    // Check width on resize
    window.addEventListener('resize', checkWidth);
    

    //

// shaders
const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D u_texture;    
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform float u_aberrationIntensity;

    void main() {
        vec2 gridUV = floor(vUv * vec2(20.0, 20.0)) / vec2(20.0, 20.0);
        vec2 centerOfPixel = gridUV + vec2(1.0/20.0, 1.0/20.0);
        
        vec2 mouseDirection = u_mouse - u_prevMouse;
        
        vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
        float pixelDistanceToMouse = length(pixelToMouseDirection);
        float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);

        vec2 uvOffset = strength * - mouseDirection * 0.2;
        vec2 uv = vUv - uvOffset;

        vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.01, 0.0));
        vec4 colorG = texture2D(u_texture, uv);
        vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.01, 0.0));

        gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
    }
`;

function initializeScene(imageContainer, imageElement) {
  let easeFactor = 0.02;
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    80,
    imageElement.offsetWidth / imageElement.offsetHeight,
    0.01,
    10
  );
  camera.position.z = 1;

  let shaderUniforms = {
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_prevMouse: { type: "v2", value: new THREE.Vector2() },
    u_aberrationIntensity: { type: "f", value: 0.0 },
    u_texture: { type: "t", value: new THREE.TextureLoader().load(imageElement.src) }
  };

  let planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader,
      fragmentShader
    })
  );

  scene.add(planeMesh);

  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(imageElement.offsetWidth, imageElement.offsetHeight);
  imageContainer.appendChild(renderer.domElement);

  let mousePosition = { x: 0.5, y: 0.5 };
  let targetMousePosition = { x: 0.5, y: 0.5 };
  let prevPosition = { x: 0.5, y: 0.5 };
  let aberrationIntensity = 0.0;

  function animateScene() {
    requestAnimationFrame(animateScene);

    mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
    mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

    planeMesh.material.uniforms.u_mouse.value.set(
      mousePosition.x,
      1.0 - mousePosition.y
    );

    planeMesh.material.uniforms.u_prevMouse.value.set(
      prevPosition.x,
      1.0 - prevPosition.y
    );

    aberrationIntensity = Math.max(0.0, aberrationIntensity - 0.05);

    planeMesh.material.uniforms.u_aberrationIntensity.value = aberrationIntensity;

    renderer.render(scene, camera);
  }

  function handleMouseMove(event) {
    easeFactor = 0.02;
    let rect = imageContainer.getBoundingClientRect();
    prevPosition = { ...targetMousePosition };

    targetMousePosition.x = (event.clientX - rect.left) / rect.width;
    targetMousePosition.y = (event.clientY - rect.top) / rect.height;

    aberrationIntensity = 1;
  }

  function handleMouseEnter(event) {
    easeFactor = 0.02;
    let rect = imageContainer.getBoundingClientRect();

    mousePosition.x = targetMousePosition.x = (event.clientX - rect.left) / rect.width;
    mousePosition.y = targetMousePosition.y = (event.clientY - rect.top) / rect.height;
  }

  function handleMouseLeave() {
    easeFactor = 0.05;
    targetMousePosition = { ...prevPosition };
  }

  imageContainer.addEventListener("mousemove", handleMouseMove);
  imageContainer.addEventListener("mouseenter", handleMouseEnter);
  imageContainer.addEventListener("mouseleave", handleMouseLeave);

  animateScene();
}

// Initialize scenes for item1, item2, and item3
initializeScene(document.getElementById("item1"), document.getElementById("img1"));
initializeScene(document.getElementById("item2"), document.getElementById("img2"));
initializeScene(document.getElementById("item3"), document.getElementById("img3"));

//
let timeoutMap = new Map();

$("span").on("mouseleave", (e) => {
  const target = $(e.target);
  
  // If a timeout already exists for this element, clear it
  if (timeoutMap.has(target)) {
    clearTimeout(timeoutMap.get(target));
  }
  
  target.addClass("exit");
  
  // Set a timeout to remove the exit class after 400ms
  const timeoutId = setTimeout(() => {
    target.removeClass("exit");
    timeoutMap.delete(target); // Clean up the map after the animation is done
  }, 400);
  
  // Store the timeout ID in the map
  timeoutMap.set(target, timeoutId);
});

$("span").on("mouseenter", (e) => {
  const target = $(e.target);
  
  // If a timeout exists for this element, clear it and remove the exit class
  if (timeoutMap.has(target)) {
    clearTimeout(timeoutMap.get(target));
    target.removeClass("exit");
    timeoutMap.delete(target); // Clean up the map
  }
});




    var ran = 0;
    var flag2 = 0;
    var flag3 = 0;
    var flag4 = 0;
    var flag5 = 0;

    $(window).scroll(function() {
      var scrollTop = $(window).scrollTop();
      var windowHeight = $(window).height();
      console.log(scrollTop/windowHeight);

      var startScroll = 0;
      var endScroll = windowHeight * 1;

      if (scrollTop >= startScroll && scrollTop <= endScroll) {
        var progress = (scrollTop - startScroll) / (endScroll - startScroll);
        var newTop = 65 + (76 - 65) * progress; // Interpolating top value
        var newScaleY = 0.6 + (0.1 - 0.6) * progress; // Interpolating scaleY value

        $('.svg-1').css({
          'top': newTop + 'vh',
          'transform': 'scaleY(' + newScaleY + ')'
        });
      }

      $(".btn-container").on("click", () => {
          window.scrollTo({top: windowHeight*2.6, behavior: 'smooth'});
      })

      var startScroll2 = windowHeight*2;
      var endScroll2 = windowHeight * 3.5;

      if (scrollTop >= startScroll2 && scrollTop <= endScroll2) {
        var progress2 = (scrollTop - startScroll2) / (endScroll2 - startScroll2);
        var newTop2 = 315 + (326 - 315) * progress2; // Interpolating top value for svg-2
        var newScaleY2 = 0.6 + (0.1 - 0.6) * progress2; // Interpolating scaleY value for svg-2

        $('.svg-2').css({
          'top': newTop2 + 'vh',
          'transform': 'scaleY(' + newScaleY2 + ')'
        });
      }



      if (scrollTop/windowHeight > 2.2) {
        if (!flag2) {
        flag2 = 1;

        anime({
          targets: '.events-title, .events-container', //add
          translateY: [200,0], // Start from -200px to 0px
          opacity: [0, 1],
          duration: 600,
          easing: 'spring(1, 80, 10, 0)',
          delay: anime.stagger(150)
        });
        }
      }

      if (scrollTop/windowHeight > 2.58) {
        if (!flag3) {
        flag3 = 1;

        anime({
          targets: '.evt2, .evt2-description, .evt2-container, .evt2-btn',
          translateY: [200,0], // Start from -200px to 0px
          opacity: [0, 1],
          duration: 600,
          easing: 'spring(1, 80, 10, 0)',
          delay: anime.stagger(150)
        });
        }
      }

      if (scrollTop/windowHeight > 3.15) {
        if (!flag4) {
        flag4 = 1;

        anime({
          targets: '.row-1, .faq-title',
          translateY: [200,0], // Start from -200px to 0px
          opacity: [0, 1],
          duration: 600,
          easing: 'spring(1, 80, 10, 0)',
          delay: anime.stagger(150)
        });
        }
      }

      if (scrollTop/windowHeight > 3.45) {
        if (!flag5) {
        flag5 = 1;

        anime({
          targets: '.row-2',
          translateY: [200,0], // Start from -200px to 0px
          opacity: [0, 1],
          duration: 600,
          easing: 'spring(1, 80, 10, 0)',
          delay: anime.stagger(150)
        });
        }
      }

      if (scrollTop/windowHeight > 1) {
        $(".header").css("opacity", "0");
      }   else {
        $(".header").css("opacity", "1");
      }


      if (scrollTop/windowHeight > 1.45) {
 
        if (ran === 1) {
          return;
        }  else {
          ran = 1;
        }

        $(".section-3 > div").css("opacity", "0");
        $(".section-3 > div").css("transform", "translateY(200px)");

        setTimeout(() => {
          
        anime({
          targets: '.section-3 > div', // Target all direct child divs within .section-3
          translateY: [-200,0], // Start from -200px to 0px
          opacity: [0, 1], // Start from opacity 0 to 1
          duration: 780, // Animation duration
          easing: 'spring(1, 80, 10, 0)',
          delay: anime.stagger(50)
        });
      }, 100);

        $(".container-text").css({
          "transform": "translateY(-1000px)",
          "opacity": "0"
        });

        $(".section-3").css({
          "transform": "translateY(0)",
          "opacity": "1"
        });
      } else {
        if ($(".container-text").css("opacity") === "1") {
          return;
        }
        ran = 0;
        $(".container-text").css({
          "transform": "translateY(0)",
          "opacity": "1"
        });
        $(".section-3").css({
          "transform": "translateY(600px)",
          "opacity": "0"
        });

        anime({
          targets: '.faq-title, .row-1, .row-2, .events-title, .events-container, .evt2, .evt2-description, .evt2-container, .evt2-btn', //add
          translateY: [0,200],
          opacity: [1, 0],
          duration: 600,
          easing: 'spring(1, 80, 10, 0)',
          delay: 150
        });
        flag2 = 0;
        flag3 = 0;
        flag4 = 0;
        flag5 = 0;
        
      }
    });
    

    const textElements = gsap.utils.toArray('.text');

    textElements.forEach(text => {
      gsap.to(text, {
        backgroundSize: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: text,
          start: 'center 80%',
          end: 'center 20%',
          scrub: true,
        },
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="video-container">
        <video id="myVideo" autoPlay loop muted>
          <source src={vid2} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="svg-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="000" fillOpacity="1" d="M0,96L48,101.3C96,107,192,117,288,144C384,171,480,213,576,224C672,235,768,213,864,218.7C960,224,1056,256,1152,240C1248,224,1344,160,1392,128L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="container-text">
        <h1 className="text">  DUIK EEN<span>  TOP SFEER</span></h1>
        <h1 className="text">  AVOND<span>  TOP MUZIEK</span></h1>
        <h1 className="text">  TERUG<span>  TOP LOCATIE</span></h1>
        <h1 className="text">  IN DE TIJD<span>  TOP LINEUP</span></h1>
      </div>

      <div className="section-3">
        <div className="s3-title">DE<br></br>&nbsp;TIJD<br></br>&nbsp;&nbsp;MACHINE</div>
        <div className="s3-sidebio">Wij zijn de ultieme Gen-Z club in Leiden, waar je kunt genieten van onvergetelijke avonden vol muziek en plezier. Onze locatie is te huur voor jouw speciale evenementen en feesten.</div>
        <div className="s3-bio">Een dynamisch team dat onvergetelijke avonden creëert voor de Gen-Z generatie, met de beste muziek, sfeer en entertainment.</div>
        <div className="s3-vid">
          <video width="300px"  loop autoPlay muted><source src={vid} type="video/mp4"></source></video>
        </div>
      </div>

      <div className="events">
        <div className="events-title">EVENTS DEZE WEEK</div>
        <div className="events-container">
          <div id="item1"><img src={item1} id="img1" alt="event_1" /></div>
          <div id="item2"><img src={item2} id="img2" alt="event_2" /></div>
          <div id="item3"><img src={item3} id="img3" alt="event_3" /></div>
        </div>

        <div className="evt2">BLIJF UP-TO-DATE?</div>
        <div className="evt2-description">Voor updates op nieuwe events en alle andere<br></br>belangrijke dingen schrijf je je in onze maillist!</div>
        <div className="evt2-container">
          <input placeholder="Voer hier je e-mailadres in"></input>
          <div className="evt2-btn">
            <p>OK!</p>
          </div>
        </div>
      </div>

      
      <div className="svg-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="000" fillOpacity="1" d="M0,96L48,101.3C96,107,192,117,288,144C384,171,480,213,576,224C672,235,768,213,864,218.7C960,224,1056,256,1152,240C1248,224,1344,160,1392,128L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>


      <div className="faq">
        <div className="faq-title ">FAQ</div>
        <div className="faq-container">
          <div className="faq-item row-1 ">
            <img src={faq1} alt="faq 1" />
          </div>
          <div className="faq-item row-1 ">
            <img src={faq2} alt="faq 2" />
          </div>
          <div className="faq-item row-1 ">
            <img src={faq3} alt="faq 3" />
          </div>
          <div className="faq-item row-1 ">
            <img src={faq4} alt="faq 4" />
          </div>
          <div className="faq-item row-2 ">
            <img src={faq5} alt="faq 5" />
          </div>
          <div className="faq-item row-2 ">
            <img src={faq6} alt="faq 6" />
          </div>
          <div className="faq-item row-2 ">
            <img src={faq7} alt="faq 7" />
          </div>
          <div className="faq-item row-2 ">
            <img src={faq8} alt="faq 8" />
          </div>
        </div>
      </div>
      <div className="footer">
        <p className="footer-title ft1">De Tijdmachine</p>
        <p className="footer-title ft2">Contact</p>
        <img src={contact} className="footer-contact" alt="contact" />
        <p className="footer-title ft3">Social Media</p>
        <img src={socials} className="footer-socials" alt="contact" />
      </div>

      <div className="header">
        <p>De Tijdmachine</p>
        <div className="btn-container">
          <p>EVENTS</p>
          <div></div>
        </div>
        <div className="header-bg">

        </div>
      </div>

      <Preloader />

    </div>
  );
}

export default App;
