import React, { useEffect } from 'react';
import $ from 'jquery';
import './App.css';

import img from './load.png';

function Preloader() {
  useEffect(() => {
    window.scrollTo({top: 0});
    $(".Preloader img").css("opacity", "1");
    $("body, #root").css("overflow-y", "hidden");

    let rotation = 0;
    const interval = setInterval(() => {
      rotation += 180;
      $(".Preloader img").css("transform", `rotate(${rotation}deg)`);
    }, 1500);

    $(() => {
      clearInterval(interval);
      setTimeout(() => {
        $(".Preloader img").css("transition", "opacity 1s");
        $(".Preloader img").css("opacity", "0");
        setTimeout(() => {
          $(".Preloader").css("top", "-100vh");
          $("body, #root").css("overflow-y", "auto");
        }, 1000);
      }, 1500);
    });

  }, []);

  return (
    <div className="Preloader">
      <img src={img} alt="sand thingy"/>
    </div>
  );
}

export default Preloader;
