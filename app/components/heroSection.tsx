"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Frames = {
  currentIndex: number;
  maxIndex: number;
};

const frames: Frames = {
  currentIndex: 0,
  maxIndex: 100, // Set to the total number of frames
};

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgArr = useRef<HTMLImageElement[]>([]);
  const loaded = useRef<number>(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    preLoadImages();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const preLoadImages = () => {
    for (let i = 1; i <= frames.maxIndex; i++) {
      const imageUrl = `/vid/frame_${i.toString().padStart(4, "0")}.jpeg`;
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        loaded.current++;
        imgArr.current.push(img);
        if (loaded.current === frames.maxIndex) {
          loadImage(frames.currentIndex);
          startAnimation();
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${imageUrl}`);
      };
    }
  };

  const loadImage = (index: number) => {
    const canvas = canvasRef.current;
    if (canvas && index >= 0 && index <= frames.maxIndex) {
      const img = imgArr.current[index];
      const context = canvas.getContext("2d");

      if (context && img) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.max(scaleX, scaleY);

        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        const offsetX = (canvas.width - newWidth) / 2;
        const offsetY = (canvas.height - newHeight) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(img, offsetX, offsetY, newWidth, newHeight);

        frames.currentIndex = index;
      }
    }
  };

  const startAnimation = () => {
    if (!tlRef.current) {
      tlRef.current = gsap.timeline({
        scrollTrigger: {
          trigger: ".parent",
          scroller: "body",
          start: "top top",
          end: "200% 200%",
          markers: true, // Set to false in production
          scrub: 2,
          pin: true,
          // onUpdate: (self) => {
          //   const progress = self.progress;
          //   const newIndex = Math.floor(progress * frames.maxIndex);
          //   if (newIndex !== frames.currentIndex) {
          //     loadImage(newIndex);
          //   }
          // },
        },
      });

      tlRef.current.to(frames, {
        currentIndex: frames.maxIndex,
        onUpdate: () => {
          loadImage(Math.floor(frames.currentIndex));
        },
        ease: "none", // Prevents easing between frames
      });
    }
  };

  const handleResize = () => {
    loadImage(frames.currentIndex);
  };

  return (
    <div className="w-full bg-zinc-900 h-screen">
      <div className="parent relative top-0 left-0 w-full h-[700vh]">
        <div className="w-full sticky top-0 left-0 h-screen">
          <canvas ref={canvasRef} id="canvas" className="w-full h-screen"></canvas>
        </div>
      </div>
    </div>
  );
}
