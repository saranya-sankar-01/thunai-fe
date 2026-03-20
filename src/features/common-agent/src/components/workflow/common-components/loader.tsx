import { Loader } from 'lucide-react';
import React, { useState, useEffect } from 'react';

/**
 * Workflow-specific loading component with connected nodes and circular progress
 */
interface WorkflowLoaderProps {
  /** Loading message to display */
  message?: string;
  /** Subtitle message */
  subtitle?: string;
  /** Size variant of the loader */
  size?: 'small' | 'medium' | 'large';
  /** Color theme for the loader */
  variant?: 'blue' | 'green' | 'cyan' | 'purple' | 'gradient';
  /** Whether to show overlay background */
  overlay?: boolean;
  /** Whether the loader should be inline or fixed positioned */
  inline?: boolean;
  /** Number of workflow nodes */
  nodeCount?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Custom CSS classes */
  className?: string;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  /** Show progress percentage */
  showProgress?: boolean;
  /** Current progress (0-100) */
  progress?: number;
}

const Loaders: React.FC<WorkflowLoaderProps> = ({
  message = "Building Your Workflow",
  subtitle = "Initializing workspace...",
  size = 'medium',
  variant = 'cyan',
  overlay = true,
  inline = false,
  nodeCount = 3,
  speed = 1,
  className = '',
  ariaLabel = 'Loading workflow',
  showProgress = false,
  progress = 0
}) => {
  const [activeNode, setActiveNode] = useState(0);
  const [circleProgress, setCircleProgress] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Cycle through nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % nodeCount);
    }, 2000 / speed);
    return () => clearInterval(interval);
  }, [nodeCount, speed]);

  // Animate circle progress
  useEffect(() => {
    const interval = setInterval(() => {
      setCircleProgress(prev => {
        const newProgress = prev + 1;
        return newProgress > 100 ? 0 : newProgress;
      });
    }, 50 / speed);
    return () => clearInterval(interval);
  }, [speed]);

  // Animation phase for particle effects
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Size configurations
  const sizeConfig = {
    small: {
      circle: 'w-32 h-32',
      node: 'w-8 h-8',
      text: 'text-lg',
      subtitle: 'text-sm',
      strokeWidth: 2
    },
    medium: {
      circle: 'w-48 h-48',
      node: 'w-12 h-12',
      text: 'text-2xl',
      subtitle: 'text-base',
      strokeWidth: 3
    },
    large: {
      circle: 'w-64 h-64',
      node: 'w-16 h-16',
      text: 'text-3xl',
      subtitle: 'text-lg',
      strokeWidth: 4
    }
  };

  // Color configurations for white background
  const colorConfig = {
    blue: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      glow: 'rgba(59, 130, 246, 0.2)',
      gradient: 'from-blue-400 to-blue-600',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280'
    },
    green: {
      primary: '#10B981',
      secondary: '#059669',
      glow: 'rgba(16, 185, 129, 0.2)',
      gradient: 'from-emerald-400 to-emerald-600',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280'
    },
    cyan: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      glow: 'rgba(6, 182, 212, 0.2)',
      gradient: 'from-cyan-400 to-cyan-600',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280'
    },
    purple: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      glow: 'rgba(139, 92, 246, 0.2)',
      gradient: 'from-purple-400 to-purple-600',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280'
    },
    gradient: {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      glow: 'rgba(6, 182, 212, 0.2)',
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280'
    }
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[variant];

  // Calculate node positions in a circle
  const getNodePosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const radius = size === 'small' ? 50 : size === 'medium' ? 70 : 90;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  // Generate workflow nodes
  const WorkflowNodes = () => {
    const nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const { x, y } = getNodePosition(i, nodeCount);
      const isActive = i === activeNode;
      const isCompleted = i < activeNode || (activeNode === nodeCount - 1 && circleProgress > 50);
      
      // Connection line to next node
      if (i < nodeCount - 1) {
        const nextPos = getNodePosition(i + 1, nodeCount);
        const hasConnection = isCompleted || (isActive && circleProgress > 30);
        
        nodes.push(
          <line
            key={`connection-${i}`}
            x1={x}
            y1={y}
            x2={nextPos.x}
            y2={nextPos.y}
            stroke={hasConnection ? currentColor.primary : '#E5E7EB'}
            strokeWidth={currentSize.strokeWidth / 2}
            strokeDasharray={hasConnection ? "0" : "5,5"}
            className="transition-all duration-500 ease-in-out"
          />
        );
      }
      
      // Node
      nodes.push(
        <g key={`node-${i}`}>
          {/* Node glow effect */}
          {isActive && (
            <circle
              cx={x}
              cy={y}
              r={currentSize.node.includes('8') ? 12 : currentSize.node.includes('12') ? 18 : 24}
              fill={currentColor.glow}
              className="animate-pulse"
            />
          )}
          
          {/* Node background */}
          <circle
            cx={x}
            cy={y}
            r={currentSize.node.includes('8') ? 8 : currentSize.node.includes('12') ? 12 : 16}
            fill={isCompleted ? currentColor.primary : isActive ? currentColor.secondary : '#F9FAFB'}
            stroke={isActive ? currentColor.primary : '#E5E7EB'}
            strokeWidth={isActive ? 2 : 1}
            className="transition-all duration-500 ease-in-out"
          />
          
          {/* Node icon or indicator */}
          {isCompleted && (
            <path
              d={`M${x-3},${y} L${x-1},${y+2} L${x+3},${y-2}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {isActive && !isCompleted && (
            <circle
              cx={x}
              cy={y}
              r="3"
              fill="white"
              className="animate-pulse"
            />
          )}
          
          {/* Particle effects for active node */}
          {isActive && [...Array(6)].map((_, particleIndex) => (
            <circle
              key={`particle-${i}-${particleIndex}`}
              cx={x + Math.cos(animationPhase * 0.1 + particleIndex) * 20}
              cy={y + Math.sin(animationPhase * 0.1 + particleIndex) * 20}
              r="1"
              fill={currentColor.primary}
              opacity={0.6}
              className="animate-pulse"
            />
          ))}
        </g>
      );
    }
    
    return nodes;
  };

  // Container classes for white background
  const containerClasses = inline
    ? `flex flex-col items-center justify-center space-y-8 p-8 bg-white ${className}`
    : `fixed inset-0 flex items-center justify-center z-50 bg-white ${className}`;

  const overlayClasses = overlay && !inline
    ? 'bg-white/95 backdrop-blur-sm'
    : 'bg-white';

  const circumference = 2 * Math.PI * (size === 'small' ? 60 : size === 'medium' ? 90 : 120);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (showProgress ? progress : circleProgress) / 100 * circumference;

  return (
    <div 
      className={`${containerClasses} ${overlayClasses}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Main workflow visualization */}
        <div className="relative">
          {/* Outer progress circle */}
          <svg 
            className={`${currentSize.circle} transform -rotate-90`}
            viewBox="0 0 200 200"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={size === 'small' ? 60 : size === 'medium' ? 90 : 120}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={currentSize.strokeWidth}
            />
            
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={size === 'small' ? 60 : size === 'medium' ? 90 : 120}
              fill="none"
              stroke={`url(#gradient-${variant})`}
              strokeWidth={currentSize.strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${currentColor.glow})`
              }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentColor.primary} />
                <stop offset="100%" stopColor={currentColor.secondary} />
              </linearGradient>
            </defs>
            
            {/* Workflow nodes and connections */}
            <g transform="translate(100, 100)">
              <WorkflowNodes />
            </g>
          </svg>
          
          {/* Center progress text */}
          {showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`${currentSize.text} font-bold`} style={{ color: currentColor.textPrimary }}>
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className={`${currentSize.text} font-semibold tracking-wide`} style={{ color: currentColor.textPrimary }}>
            {message}
          </h2>
          <p className={`${currentSize.subtitle}`} style={{ color: currentColor.textSecondary }}>
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Screen reader text */}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default Loaders;