import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PaperProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'blank' | 'lined' | 'grid' | 'dotted' | 'cornell';
  children?: ReactNode;
  showMargin?: boolean;
}

export const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ className, variant = 'blank', children, showMargin = true, ...props }, ref) => {
    const patterns: Record<string, string> = {
      blank: '',
      lined: `
        repeating-linear-gradient(
          transparent,
          transparent 27px,
          #e5e7eb 28px
        )
      `,
      grid: `
        linear-gradient(#e5e7eb 1px, transparent 1px),
        linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
      `,
      dotted: `
        radial-gradient(circle, #d1d5db 1px, transparent 1px)
      `,
      cornell: '',
    };

    const sizes: Record<string, string> = {
      blank: '',
      lined: '',
      grid: '20px 20px',
      dotted: '20px 20px',
      cornell: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-[#fefdf8] rounded-sm shadow-md',
          'transition-shadow duration-200',
          'hover:shadow-lg',
          className
        )}
        style={{
          backgroundImage: patterns[variant],
          backgroundSize: sizes[variant] || undefined,
          backgroundPosition: variant === 'lined' ? '0 8px' : undefined,
        }}
        {...props}
      >
        {showMargin && variant !== 'cornell' && (
          <div className="absolute left-16 top-0 bottom-0 w-px bg-rose-300/50 pointer-events-none" />
        )}
        {variant === 'cornell' && (
          <>
            <div className="absolute left-1/4 top-0 bottom-20 w-px bg-rose-300/50 pointer-events-none" />
            <div className="absolute left-0 right-0 bottom-20 h-px bg-rose-300/50 pointer-events-none" />
          </>
        )}
        {children}
      </div>
    );
  }
);
Paper.displayName = 'Paper';

interface PaperHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: string;
  color?: string;
  date?: Date;
}

export function PaperHeader({ title, icon, color, date, className, ...props }: PaperHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b-2',
        className
      )}
      style={{ borderColor: color || '#e5e7eb' }}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 
          className="text-xl font-semibold tracking-tight"
          style={{ color: color || '#1f2937' }}
        >
          {title}
        </h2>
      </div>
      {date && (
        <time className="text-sm text-gray-500">
          {date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </time>
      )}
    </div>
  );
}

interface PaperSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  color?: string;
}

export function PaperSection({ title, color, children, className, ...props }: PaperSectionProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {title && (
        <h3 
          className="text-sm font-medium uppercase tracking-wider mb-3"
          style={{ color: color || '#6b7280' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 6,
  color = '#10b981'
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span 
        className="absolute text-xs font-semibold"
        style={{ color }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  );
}

interface CrumpleAnimationProps {
  isAnimating: boolean;
  children: ReactNode;
}

export function CrumpleAnimation({ isAnimating, children }: CrumpleAnimationProps) {
  return (
    <div
      className={cn(
        'transition-all duration-500 origin-center',
        isAnimating && 'animate-crumple'
      )}
      style={{
        transform: isAnimating ? 'scale(0) rotate(180deg)' : 'scale(1) rotate(0)',
        opacity: isAnimating ? 0 : 1,
      }}
    >
      {children}
    </div>
  );
}

// Rating scale component for monthly reflections
interface RatingScaleProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  color?: string;
}

export function RatingScale({ label, value, onChange, max = 10, color = '#6366f1' }: RatingScaleProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 w-32">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={cn(
              'w-6 h-6 rounded-full text-xs font-medium transition-all',
              i < value
                ? 'text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            )}
            style={{ 
              backgroundColor: i < value ? color : undefined,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <span className="text-sm font-medium" style={{ color }}>
        {value}/{max}
      </span>
    </div>
  );
}

// Tag input for feelings, topics, etc.
interface TagInputProps {
  tags: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  color?: string;
}

export function TagInput({ 
  tags, 
  suggestions = [], 
  onChange, 
  placeholder = 'Add tag...',
  color = '#6366f1'
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-white min-h-[42px]">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm text-white"
            style={{ backgroundColor: color }}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:opacity-70"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input) {
              e.preventDefault();
              addTag(input);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] outline-none text-sm"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
          {filteredSuggestions.map(suggestion => (
            <button
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
