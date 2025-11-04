import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const Meter = () => {
  const [value, setValue] = useState(7.53);
  const [decimalOffset, setDecimalOffset] = useState(0);
  const [previousFractional, setPreviousFractional] = useState(0);
  const [hundredsOffset, setHundredsOffset] = useState(0);
  const [tensOffset, setTensOffset] = useState(0);
  const [unitsOffset, setUnitsOffset] = useState(0);
  const [previousDigits, setPreviousDigits] = useState([0, 0, 0]);

  const digitHeight = 80;
  const DIGIT_REPEAT = 20;
  const DIGIT_VALUES = 10;
  const STEP = 0.01;
  const MIN_VALUE = 0;
  const MAX_VALUE = 999.999;

  const digitStripsRef = useRef([]);

  useEffect(() => {
    // Generate digit strips
    const wrappers = document.querySelectorAll('.digit-wrapper');
    wrappers.forEach((wrapper, index) => {
      const strip = document.createElement('div');
      strip.className = 'digit-strip';
      for (let repeat = 0; repeat < DIGIT_REPEAT; repeat += 1) {
        for (let digit = 0; digit < DIGIT_VALUES; digit += 1) {
          const cell = document.createElement('div');
          cell.className = 'digit';
          cell.textContent = digit;
          strip.appendChild(cell);
        }
      }
      wrapper.appendChild(strip);
      digitStripsRef.current[index] = strip;
    });
    updateCounter();
  }, []);

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const updateCounter = () => {
    const safeValue = clamp(value, MIN_VALUE, MAX_VALUE);
    const intPart = Math.floor(safeValue);
    const fractional = safeValue - intPart;

    let newDecimalOffset = decimalOffset;
    if (fractional < previousFractional) {
      newDecimalOffset += 10;
      setDecimalOffset(newDecimalOffset);
    }
    setPreviousFractional(fractional);

    const digits = [
      Math.floor(intPart / 100) % 10,
      Math.floor(intPart / 10) % 10,
      intPart % 10
    ];

    let newHundredsOffset = hundredsOffset;
    let newTensOffset = tensOffset;
    let newUnitsOffset = unitsOffset;
    for (let i = 2; i >= 0; i--) {
      if (digits[i] < previousDigits[i]) {
        if (i === 0) newHundredsOffset += 10;
        else if (i === 1) newTensOffset += 10;
        else newUnitsOffset += 10;
      }
    }
    setPreviousDigits(digits);
    setHundredsOffset(newHundredsOffset);
    setTensOffset(newTensOffset);
    setUnitsOffset(newUnitsOffset);

    digitStripsRef.current.slice(0, 3).forEach((strip, index) => {
      let offset = 0;
      if (index === 0) offset = newHundredsOffset;
      else if (index === 1) offset = newTensOffset;
      else offset = newUnitsOffset;
      strip.style.transform = `translateY(${-(digits[index] + offset) * digitHeight}px)`;
    });

    const decimalPosition = fractional * 10 + newDecimalOffset;
    digitStripsRef.current[3].style.transform = `translateY(${-decimalPosition * digitHeight}px)`;
  };

  useEffect(() => {
    if (digitStripsRef.current.length > 0) {
      updateCounter();
    }
  }, [value, decimalOffset, hundredsOffset, tensOffset, unitsOffset]);

  const handleInc = () => {
    setValue(Number((value + STEP).toFixed(3)));
  };

  const handleDec = () => {
    setValue(Number((value - STEP).toFixed(3)));
  };

  const handleInc05 = () => {
    setValue(Number((value + 0.5).toFixed(3)));
  };

  const handleDec05 = () => {
    setValue(Number((value - 0.5).toFixed(3)));
  };

  return (
    <>
      <div className="counter-container" id="counter">
        <div className="digit-wrapper" data-role="hundreds"></div>
        <div className="digit-wrapper" data-role="tens"></div>
        <div className="digit-wrapper" data-role="units"></div>
        <div className="decimal-point">.</div>
        <div className="digit-wrapper" data-role="decimal"></div>
      </div>

      <div className="controls">
        <button id="dec" onClick={handleDec}>−0.01</button>
        <button id="inc" onClick={handleInc}>+0.01</button>
        <button id="dec05" onClick={handleDec05}>−0.5</button>
        <button id="inc05" onClick={handleInc05}>+0.5</button>
      </div>
    </>
  );
};

export default Meter;