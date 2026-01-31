'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Calendar, User } from 'lucide-react';

interface SurveyResponseData {
  id: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  answers: {
    id: string;
    question: {
      id: string;
      text: string;
      type: string;
      order: number;
    };
    value: string | string[];
  }[];
  submittedAt: string;
}

function SurveyResponsesContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [responses, setResponses] = useState<SurveyResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [surveyTitle, setSurveyTitle] = useState('');

  useEffect(() => {
    const loadResponses = async () => {
      try {
        setLoading(true);
        const [responsesData, surveyData] = await Promise.all([
          api.getSurveyResponses(id),
          api.getSurveyById(id),
        ]);
        setResponses(responsesData);
        setSurveyTitle(surveyData.title);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load responses');
      } finally {
        setLoading(false);
      }
    };

    loadResponses();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
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
          <h1 className="text-2xl font-bold">Survey Responses</h1>
          <p className="text-sm text-gray-600">{surveyTitle}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>
                  {responses.length} {responses.length === 1 ? 'response' : 'responses'} received
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {responses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No responses submitted yet.
              </div>
            ) : (
              <div className="space-y-6">
                {responses.map((response) => (
                  <Card key={response.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold">
                              {response.submittedBy.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {response.submittedBy.email}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(response.submittedAt).toLocaleDateString()}{' '}
                          {new Date(response.submittedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {response.answers
                          .sort((a, b) => a.question.order - b.question.order)
                          .map((answer) => (
                            <div
                              key={answer.id}
                              className="border-l-2 border-gray-200 pl-4"
                            >
                              <p className="font-medium text-gray-700 text-sm mb-1">
                                {answer.question.text}
                              </p>
                              <p className="text-gray-900">
                                {Array.isArray(answer.value) ? (
                                  <span className="flex flex-wrap gap-1">
                                    {answer.value.map((val, idx) => (
                                      <Badge key={idx} variant="outline">
                                        {val}
                                      </Badge>
                                    ))}
                                  </span>
                                ) : (
                                  answer.value
                                )}
                              </p>
                            </div>
                          ))}
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center text-sm text-gray-600">
                        <FileText className="mr-2 h-4 w-4" />
                        {response.answers.length} answers provided
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SurveyResponsesPage() {
  return (
    <ProtectedRoute>
      <SurveyResponsesContent />
    </ProtectedRoute>
  );
}
