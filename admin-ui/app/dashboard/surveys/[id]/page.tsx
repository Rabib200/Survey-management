'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { SurveyForm } from '@/components/survey-form';
import { api } from '@/lib/api';
import { Survey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function EditSurveyContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const data = await api.getSurveyById(id);
        setSurvey(data);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to load survey');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
      await api.updateSurvey(id, data);
      router.push('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update survey');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Edit Survey</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SurveyForm
          initialData={{
            title: survey.title,
            description: survey.description || '',
            questions: survey.questions,
          }}
          onSubmit={handleSubmit}
          submitLabel="Update Survey"
        />
      </main>
    </div>
  );
}

export default function EditSurveyPage() {
  return (
    <ProtectedRoute>
      <EditSurveyContent />
    </ProtectedRoute>
  );
}
