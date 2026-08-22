import React from 'react';
import type { CmsRichTextSection } from '@ecom/types';
import { Container } from '../ui/container';

export interface RichTextSectionProps {
  section: CmsRichTextSection;
}

export const RichTextSection: React.FC<RichTextSectionProps> = ({ section }) => {
  return (
    <section className="w-full py-8 sm:py-12 bg-white">
      <Container size="md">
        <div
          className="prose prose-sm sm:prose-base text-gray-700 max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: section.content }}
        />
      </Container>
    </section>
  );
};
RichTextSection.displayName = 'RichTextSection';
