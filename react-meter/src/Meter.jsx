import { useState, useEffect, useRef, useCallback } from 'react';
import './style.css';

const DIGIT_HEIGHT = 80;
const DIGIT_REPEAT = 10;

const DIGIT_VALUES = 10;
const MIN_VALUE = 0;
const MAX_VALUE = 999.999;

const Meter = ({ value: propValue, onChange, initialValue = 0 }) => {
  const [internalValue, setInternalValue] = useState(initialValue);
  const value = propValue !== undefined ? propValue : internalValue;
  const [offsets, setOffsets] = useState({
    hundreds: DIGIT_REPEAT,
    tens: DIGIT_REPEAT * 6,
    units: DIGIT_REPEAT * 6,
    decimal: DIGIT_REPEAT * 6,
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

    // Calculate current digits (decimal, hundreds, tens, units)
    const digits = [
      Math.floor(intPart / 100) % 10, // hundreds
      Math.floor(intPart / 10) % 10, // tens
      intPart % 10, // units
      fractional * 10, // decimal
    ];

    const prevDigits = [
      previousState.digits[0], // previous hundreds
      previousState.digits[1], // previous tens
      previousState.digits[2], // previous units
      previousState.fractional * 10 // previous decimal
    ];

    const keys = ['hundreds', 'tens', 'units','decimal'];
    const totalDigits = DIGIT_REPEAT * DIGIT_VALUES;

    // Update all digit offsets with unified wrap logic
    digits.forEach((digit, i) => {
      const prevDigit = prevDigits[i];
      const digitDiff = digit - prevDigit;

      if (digitDiff < -5) {
        // Wrapped forward (e.g. 9->0)
        newOffsets[keys[i]] += 10;
      } else if (digitDiff > 5) {
        // Wrapped backward (e.g. 0->9)
        newOffsets[keys[i]] -= 10;
      }

      // Calculate position with offset
      let position = digit + newOffsets[keys[i]];

      // Wrap to opposite side if at edge
      let isAtEdge = false;
      if (position >= totalDigits) {
        newOffsets[keys[i]] = 0;
        position = digit;
        isAtEdge = true;
      } else if (position < 0) {
        newOffsets[keys[i]] = totalDigits - DIGIT_VALUES;
        position = digit + newOffsets[keys[i]];
        isAtEdge = true;
      }

      // If at edge and wrapping, apply direct animation (no transition)
      const strip = digitStripsRef.current[i];
      if (isAtEdge) {
        strip.style.transition = 'transform 0.13s cubic-bezier(0.33, 1, 0.68, 1)';
        strip.style.transform = `translateY(${-position * DIGIT_HEIGHT}px)`;
        void strip.offsetWidth;
        strip.style.transition = '';
      } else {
        strip.style.transition = '';
        strip.style.transform = `translateY(${-position * DIGIT_HEIGHT}px)`;
      }

    });

    // Update state
    setOffsets(newOffsets);
    setPreviousState({ 
      fractional, 
      digits: [digits[0], digits[1], digits[2]]
    });
  }, [value, offsets, previousState]);
  
  useEffect(() => {
    updateCounter();
  }, [value]);

  useEffect(() => {
    onChange?.(value);
  }, [value, onChange]);

  return (
    <>
      <div className="counter-container" id="counter">
        <div className="digit-wrapper" data-role="hundreds"></div>
        <div className="digit-wrapper" data-role="tens"></div>
        <div className="digit-wrapper" data-role="units"></div>
        <div className="decimal-point">.</div>
        <div className="digit-wrapper" data-role="decimal"></div>
      </div>
    </>
  );
};

export default Meter;

export const useMeter = (initialValue = 0) => {
  const [value, setValue] = useState(initialValue);
  return { value, setValue };
};