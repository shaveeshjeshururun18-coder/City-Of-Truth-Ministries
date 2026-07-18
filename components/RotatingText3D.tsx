import React from 'react';

interface RotatingText3DProps {
  word1?: string;
  word2?: string;
  word3?: string;
}

export const RotatingText3D: React.FC<RotatingText3DProps> = ({ 
  word1 = "CITY", 
  word2 = "OF", 
  word3 = "TRUTH" 
}) => {
  return (
    <div className="relative flex justify-center items-center min-h-[100px] overflow-hidden w-full bg-slate-900 rounded-xl shadow-inner my-6">
      <style>
        {`
          .rotate-container {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .rotate-box {
            transform-style: preserve-3d;
            animation: rotateAnimate 7s ease-in-out infinite alternate;
          }
          .rotate-box span {
            background: linear-gradient(90deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5) 90%, transparent);
            text-transform: uppercase;
            line-height: 0.76em;
            position: absolute;
            color: #fff;
            font-size: 1.5em;
            white-space: nowrap;
            font-weight: bold;
            padding: 0px 10px;
            transform-style: preserve-3d;
            text-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
            transform: translate(-50%, -50%) rotateX(calc(var(--i) * 22.5deg)) translateZ(45px);
          }
          .rotate-box span i {
            font-style: initial;
          }
          .rotate-box span i:nth-child(1) {
            color: #5c5fc4;
          }
          .rotate-box span i:nth-child(2) {
            color: #c4c15c;
          }
          
          @keyframes rotateAnimate {
            0% {
              transform: perspective(500px) rotateX(0deg) rotate(5deg);
            }
            100% {
              transform: perspective(50px) rotateX(360deg) rotate(5deg);
            }
          }
        `}
      </style>
      <div className="rotate-container">
        <div className="rotate-box">
          {[...Array(16)].map((_, index) => (
            <span key={index} style={{ '--i': index + 1 } as React.CSSProperties}>
              <i>{word1}</i> {word2} <i>{word3}</i>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
