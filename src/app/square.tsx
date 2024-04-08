import React from 'react';

interface SquareProps {
  color: string;
  size: number;
  onClick: () => void,
  onMouseOver: () => void,
}

const Square: React.FC<SquareProps> = ({ color, size, onClick, onMouseOver }) => {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: '4px',
    boxSizing: 'border-box',
    transition: '.5s all'
  };

  return <div style={style} onClick={() => onClick()} onMouseOver={() => onMouseOver()}></div>;
};

export default Square;
