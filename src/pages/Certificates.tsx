import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Download, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';

interface Certificate {
  id: string;
  certificate_type: string;
  wpm: number;
  accuracy: number;
  issued_at: string;
  title: string;
  description: string;
}

const getCertificateTitle = (type: string) => {
  const titles: Record<string, string> = {
    beginner: 'Typing Beginner',
    intermediate: 'Typing Proficient',
    advanced: 'Typing Expert',
    master: 'Typing Master',
    speed_demon: 'Speed Demon (100+ WPM)',
    perfectionist: 'Perfectionist (100% Accuracy)',
  };
  return titles[type] || type;
};

const getCertificateColor = (type: string) => {
  const colors: Record<string, string> = {
    beginner: 'from-green-500 to-emerald-600',
    intermediate: 'from-blue-500 to-indigo-600',
    advanced: 'from-purple-500 to-violet-600',
    master: 'from-amber-500 to-orange-600',
    speed_demon: 'from-red-500 to-rose-600',
    perfectionist: 'from-cyan-500 to-teal-600',
  };
  return colors[type] || 'from-primary to-accent';
};

const Certificates: React.FC = () => {
  const { user } = useAuth();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user!.id)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user,
  });

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Your Certificates</h1>
          <p className="text-muted-foreground">Proof of your typing achievements</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading certificates...</div>
        ) : certificates?.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <Award className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete typing milestones to earn certificates!
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>🎯 Reach 30 WPM - Beginner Certificate</p>
              <p>🎯 Reach 50 WPM - Intermediate Certificate</p>
              <p>🎯 Reach 80 WPM - Advanced Certificate</p>
              <p>🎯 Reach 100 WPM - Speed Demon Certificate</p>
              <p>🎯 100% Accuracy Test - Perfectionist Certificate</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates?.map((cert) => (
              <Card key={cert.id} className="overflow-hidden">
                <div className={`bg-gradient-to-r ${getCertificateColor(cert.certificate_type)} p-6 text-white`}>
                  <Award className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-1">{getCertificateTitle(cert.certificate_type)}</h3>
                  <p className="opacity-90">Certificate of Achievement</p>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">WPM Achieved</p>
                      <p className="text-2xl font-bold text-primary">{cert.wpm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-2xl font-bold text-accent">{cert.accuracy}%</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Issued on {format(new Date(cert.issued_at), 'MMMM d, yyyy')}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-1" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
