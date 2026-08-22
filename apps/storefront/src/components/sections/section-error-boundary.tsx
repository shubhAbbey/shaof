'use client';

import React from 'react';

export interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  componentType?: string;
  fallback?: React.ReactNode;
}

export interface SectionErrorBoundaryState {
  hasError: boolean;
}

/**
 * Isolated Client Component Error Boundary for dynamic CMS sections.
 */
export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Section rendering error in [${this.props.componentType || 'dynamic-section'}]:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
