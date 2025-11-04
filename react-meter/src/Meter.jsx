import React, { useState, useEffect, useRef, useCallback } from 'react';
import './style.css';

const DIGIT_HEIGHT = 80;
const DIGIT_REPEAT = 20;

const DIGIT_VALUES = 10;
const STEP = 0.15;
const MIN_VALUE = 0;
const MAX_VALUE = 999.999;

const Meter = () => {
  const [value, setValue] = useState(7.5);
  const [offsets, setOffsets] = useState({
    decimal: DIGIT_REPEAT,
    hundreds: DIGIT_REPEAT,
    tens: DIGIT_REPEAT,
    units: DIGIT_REPEAT
  });
  const [previousState, setPreviousState] = useState({
    fractional: 0,
    digits: [0, 0, 0]
  });

  const digitStripsRef = useRef([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const wrappers = document.querySelectorAll('.digit-wrapper');
    const fragment = document.createDocumentFragment();
    
    wrappers.forEach((wrapper, index) => {
      const strip = document.createElement('div');
      strip.className = 'digit-strip';
      
      for (let repeat = 0; repeat < DIGIT_REPEAT; repeat++) {
        for (let digit = 0; digit < DIGIT_VALUES; digit++) {
          const cell = document.createElement('div');
          cell.className = 'digit';
          cell.textContent = digit;
          strip.appendChild(cell);
        }
      }
      
      strip.classList.add('smooth');
      wrapper.appendChild(strip);
      digitStripsRef.current[index] = strip;
    });
    
    isInitializedRef.current = true;
  }, []);

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const updateCounter = useCallback(() => {
    if (!digitStripsRef.current.length) return;

    const safeValue = clamp(value, MIN_VALUE, MAX_VALUE);
    const intPart = Math.floor(safeValue);
    const fractional = Math.round((safeValue - intPart) * 1000) / 1000;

    const newOffsets = { ...offsets };

    // Update decimal offset with bidirectional wrap detection
    const fracDiff = fractional - previousState.fractional;
    if (fracDiff < -0.5) {
      // Wrapped forward (e.g. 0.99 -> 0.00) when incrementing
      newOffsets.decimal += 10;
    } else if (fracDiff > 0.5) {
      // Wrapped backward (e.g. 0.00 -> 0.99) when decrementing
      newOffsets.decimal -= 10;
    }

    // Calculate current digits
    const digits = [
      Math.floor(intPart / 100) % 10,
      Math.floor(intPart / 10) % 10,
      intPart % 10
    ];

    // Update integer offsets with bidirectional support
    digits.forEach((digit, i) => {
      const prevDigit = previousState.digits[i];
      const digitDiff = digit - prevDigit;

      if (digitDiff < -5 || (digitDiff < 0 && prevDigit - digit > 1)) {
        // Wrapped forward: 9->0 or smooth decrement
        const key = ['hundreds', 'tens', 'units'][i];
        newOffsets[key] += 10;
      } else if (digitDiff > 5 || (digitDiff > 0 && digit - prevDigit > 1)) {
        // Wrapped backward: 0->9 or smooth increment
        const key = ['hundreds', 'tens', 'units'][i];
        newOffsets[key] -= 10;
      }
    });

    // Batch state updates
    setOffsets(newOffsets);
    setPreviousState({ fractional, digits });

    // Apply transforms
    const stripOffsets = [newOffsets.hundreds, newOffsets.tens, newOffsets.units];
    digitStripsRef.current.slice(0, 3).forEach((strip, index) => {
      strip.style.transform = `translateY(${-(digits[index] + stripOffsets[index]) * DIGIT_HEIGHT}px)`;
    });

    let decimalPosition = fractional * 10 + newOffsets.decimal;
    
    // Wrap decimal position if it goes beyond limits
    const totalDecimalDigits = DIGIT_REPEAT * DIGIT_VALUES;
    // Wrap to the other end if we reach the edge
    if (decimalPosition >= totalDecimalDigits) {
      newOffsets.decimal = 0;
      decimalPosition = 0;
      setOffsets(newOffsets);
    } else if (decimalPosition < 0) {
      newOffsets.decimal = totalDecimalDigits - DIGIT_VALUES;
      decimalPosition = totalDecimalDigits - 1;
      setOffsets(newOffsets);
    }
    
    digitStripsRef.current[3].style.transform = `translateY(${-decimalPosition * DIGIT_HEIGHT}px)`;
  }, [value, offsets, previousState]);

  useEffect(() => {
    updateCounter();
  }, [value]);

  const handleInc = useCallback(() => {
    setValue(prev => Math.max(0, Number((prev + STEP).toFixed(3))));
  }, []);

  const handleDec = useCallback(() => {
    setValue(prev => Math.max(0, Number((prev - STEP).toFixed(3))));
  }, []);

  const handleInc05 = useCallback(() => {
    setValue(prev => Math.max(0, Number((prev + 0.5).toFixed(3))));
  }, []);

  const handleDec05 = useCallback(() => {
    setValue(prev => Math.max(0, Number((prev - 0.5).toFixed(3))));
  }, []);

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