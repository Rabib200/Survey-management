'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { SurveyResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';

function SubmissionsContent() {
  const [submissions, setSubmissions] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const data = await api.getMySubmissions();
        setSubmissions(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

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
          <h1 className="text-2xl font-bold">My Submissions</h1>
          <p className="text-sm text-gray-600">View your submitted survey responses</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              All your submitted surveys are listed below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven&apos;t submitted any surveys yet.</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/dashboard')}
                >
                  Browse Surveys
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {submission.survey.title}
                          </CardTitle>
                          {submission.survey.description && (
                            <CardDescription className="mt-1">
                              {submission.survey.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary">Submitted</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <FileText className="mr-2 h-4 w-4" />
                          {submission.answers?.length || 0} answers
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(submission.submittedAt).toLocaleDateString()}{' '}
                          at {new Date(submission.submittedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2">Your Responses:</h4>
                        <div className="space-y-3">
                          {submission.answers
                            .sort((a, b) => a.question.order - b.question.order)
                            .map((answer) => (
                              <div key={answer.id} className="text-sm">
                                <p className="font-medium text-gray-700">
                                  {answer.question.text}
                                </p>
                                <p className="text-gray-600 mt-1">
                                  {Array.isArray(answer.value)
                                    ? answer.value.join(', ')
                                    : answer.value}
                                </p>
                              </div>
                            ))}
                        </div>
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

export default function SubmissionsPage() {
  return (
    <ProtectedRoute>
      <SubmissionsContent />
    </ProtectedRoute>
  );
}
