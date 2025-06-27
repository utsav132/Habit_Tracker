import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  const hourInterval = useRef<NodeJS.Timeout | null>(null);
  const minuteInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const [time] = value.split(' ');
    const [h, m] = time.split(':').map(Number);
    
    if (h === 0) {
      setHours(12);
      setAmpm('AM');
    } else if (h < 12) {
      setHours(h);
      setAmpm('AM');
    } else if (h === 12) {
      setHours(12);
      setAmpm('PM');
    } else {
      setHours(h - 12);
      setAmpm('PM');
    }
    
    setMinutes(m);
  }, [value]);

  const updateTime = (newHours: number, newMinutes: number, newAmpm: 'AM' | 'PM') => {
    let hour24 = newHours;
    if (newAmpm === 'AM' && newHours === 12) hour24 = 0;
    if (newAmpm === 'PM' && newHours !== 12) hour24 = newHours + 12;
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    onChange(timeString);
  };

  const adjustHours = (delta: number) => {
    const newHours = ((hours - 1 + delta + 12) % 12) + 1;
    setHours(newHours);
    updateTime(newHours, minutes, ampm);
  };

  const adjustMinutes = (delta: number) => {
    const newMinutes = (minutes + delta + 60) % 60;
    setMinutes(newMinutes);
    updateTime(hours, newMinutes, ampm);
  };

  const toggleAmPm = () => {
    const newAmpm = ampm === 'AM' ? 'PM' : 'AM';
    setAmpm(newAmpm);
    updateTime(hours, minutes, newAmpm);
  };

  const startInterval = (callback: () => void, ref: React.MutableRefObject<NodeJS.Timeout | null>) => {
    callback();
    ref.current = setInterval(callback, 100);
  };

  const stopInterval = (ref: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };

  return (
    <div className="flex items-center justify-center space-x-4 bg-white rounded-lg p-4 border border-gray-200">
      {/* Hours */}
      <div className="flex flex-col items-center">
        <button
          onMouseDown={() => startInterval(() => adjustHours(1), hourInterval)}
          onMouseUp={() => stopInterval(hourInterval)}
          onMouseLeave={() => stopInterval(hourInterval)}
          onTouchStart={() => startInterval(() => adjustHours(1), hourInterval)}
          onTouchEnd={() => stopInterval(hourInterval)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
          {hours.toString().padStart(2, '0')}
        </span>
        <button
          onMouseDown={() => startInterval(() => adjustHours(-1), hourInterval)}
          onMouseUp={() => stopInterval(hourInterval)}
          onMouseLeave={() => stopInterval(hourInterval)}
          onTouchStart={() => startInterval(() => adjustHours(-1), hourInterval)}
          onTouchEnd={() => stopInterval(hourInterval)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <span className="text-2xl font-bold text-gray-600">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <button
          onMouseDown={() => startInterval(() => adjustMinutes(1), minuteInterval)}
          onMouseUp={() => stopInterval(minuteInterval)}
          onMouseLeave={() => stopInterval(minuteInterval)}
          onTouchStart={() => startInterval(() => adjustMinutes(1), minuteInterval)}
          onTouchEnd={() => stopInterval(minuteInterval)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronUp className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
          {minutes.toString().padStart(2, '0')}
        </span>
        <button
          onMouseDown={() => startInterval(() => adjustMinutes(-1), minuteInterval)}
          onMouseUp={() => stopInterval(minuteInterval)}
          onMouseLeave={() => stopInterval(minuteInterval)}
          onTouchStart={() => startInterval(() => adjustMinutes(-1), minuteInterval)}
          onTouchEnd={() => stopInterval(minuteInterval)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* AM/PM */}
      <button
        onClick={toggleAmPm}
        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors min-w-[3rem]"
      >
        {ampm}
      </button>
    </div>
  );
};

export default TimePicker;