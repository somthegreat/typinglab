import React from 'react';
import Layout from '@/components/layout/Layout';
import TypingTest from '@/components/typing/TypingTest';

const Test: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        <TypingTest />
      </div>
    </Layout>
  );
};

export default Test;
