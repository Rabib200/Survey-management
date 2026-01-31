'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { SurveyForm } from '@/components/survey-form';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function CreateSurveyContent() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await api.createSurvey(data);
      router.push('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create survey');
      throw err;
    }
  };

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
          <h1 className="text-2xl font-bold">Create New Survey</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SurveyForm onSubmit={handleSubmit} submitLabel="Create Survey" />
      </main>
    </div>
  );
}

export default function CreateSurveyPage() {
  return (
    <ProtectedRoute>
      <CreateSurveyContent />
    </ProtectedRoute>
  );
}
