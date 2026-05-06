import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import TypingTest from '@/components/typing/TypingTest';

const Test: React.FC = () => {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', 'https://typinglab.lovable.app/test');
    return () => {
      if (link) link.remove();
    };
  }, []);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8">
        <h1 className="text-center text-3xl font-bold tracking-tight text-foreground mb-4">
          Typing Test
        </h1>
        <TypingTest />
      </div>
    </Layout>
  );
};

export default Test;
