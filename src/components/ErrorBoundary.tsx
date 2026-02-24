/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the entire application.
 * 
 * Why this prevents demo crash:
 * - Pose processing can fail on unusual inputs
 * - Canvas operations can throw on invalid data
 * - Third-party libraries may have edge cases
 * - A graceful fallback keeps the demo professional
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // In production, you might send to error tracking service
    // e.g., Sentry.captureException(error);
  }
  
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys?.[idx]
      );
      
      if (hasChanged) {
        this.reset();
      }
    }
  }
  
  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };
  
  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.reset}
        />
      );
    }
    
    return this.props.children;
  }
}

// ============================================================================
// FALLBACK UI
// ============================================================================

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
  title?: string;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  onReset,
  title = 'Something went wrong',
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-2">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-gray-400 mb-6">
          We encountered an unexpected error. This has been logged and we&apos;ll look into it.
        </p>
        
        {/* Error Details (Development) */}
        {showDetails && error && (
          <div className="mb-6 p-4 rounded-lg bg-gray-800 text-left overflow-auto max-h-32">
            <p className="text-xs text-red-400 font-mono">
              {error.name}: {error.message}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onReset && (
            <Button
              variant="outline"
              onClick={onReset}
            >
              Try Again
            </Button>
          )}
          
          <Button onClick={handleReload}>
            Reload Page
          </Button>
        </div>
        
        {/* Help Link */}
        <p className="mt-6 text-xs text-gray-500">
          If this keeps happening,{' '}
          <a href="#" className="text-blue-400 hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// ANALYSIS ERROR FALLBACK
// ============================================================================

interface AnalysisErrorFallbackProps {
  onRetry?: () => void;
  onNewRecording?: () => void;
}

export function AnalysisErrorFallback({
  onRetry,
  onNewRecording,
}: AnalysisErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <span className="text-3xl">🔄</span>
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-2">
          Analysis Error
        </h2>
        
        {/* Message */}
        <p className="text-gray-400 mb-6">
          We couldn&apos;t complete the analysis. This might happen with unusual camera angles
          or low lighting conditions.
        </p>
        
        {/* Suggestions */}
        <div className="mb-6 p-4 rounded-lg bg-gray-800 text-left">
          <p className="text-sm text-gray-300 mb-2 font-medium">Tips for better results:</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Ensure good lighting</li>
            <li>• Keep full body visible in frame</li>
            <li>• Use a stable camera position</li>
            <li>• Record in a clear, uncluttered space</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Retry Analysis
            </Button>
          )}
          
          {onNewRecording && (
            <Button onClick={onNewRecording}>
              New Recording
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}