'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { api } from '@/lib/api';
import { Answer, Question, Survey, SurveyType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

function SurveySubmissionContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const surveys = await api.getActiveSurveys();
        const foundSurvey = surveys.find((s) => s.id === id);
        if (!foundSurvey) {
          throw new Error('Survey not found or is no longer active');
        }
        setSurvey(foundSurvey);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [id]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    const newAnswers = checked
      ? [...currentAnswers, option]
      : currentAnswers.filter((a) => a !== option);
    setAnswers((prev) => ({ ...prev, [questionId]: newAnswers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required questions
    const requiredQuestions = survey?.questions.filter((q) => q.isRequired) || [];
    for (const question of requiredQuestions) {
      const answer = answers[question.id];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        setError(`Please answer the required question: ${question.text}`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const submitData = {
        surveyId: id,
        answers: Object.entries(answers)
          .filter(([_, value]) => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return value !== '' && value !== null && value !== undefined;
          })
          .map(([questionId, value]) => ({
            questionId,
            value,
          })),
      };

      await api.submitSurvey(submitData);
      alert('Survey submitted successfully!');
      router.push('/submissions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case SurveyType.TEXT:
        return (
          <Textarea
            value={(answers[question.id] as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Your answer"
            required={question.isRequired}
          />
        );

      case SurveyType.RADIO:
        return (
          <RadioGroup
            value={(answers[question.id] as string) || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            required={question.isRequired}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case SurveyType.CHECKBOX:
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={
                    ((answers[question.id] as string[]) || []).includes(option)
                  }
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(question.id, option, checked as boolean)
                  }
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case SurveyType.DROPDOWN:
        return (
          <Select
            value={(answers[question.id] as string) || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            required={question.isRequired}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          {survey.description && (
            <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {survey.questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}
                    {question.isRequired && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </CardTitle>
                  <CardDescription>{question.text}</CardDescription>
                </CardHeader>
                <CardContent>{renderQuestion(question)}</CardContent>
              </Card>
            ))}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Survey'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function SurveySubmissionPage() {
  return (
    <ProtectedRoute>
      <SurveySubmissionContent />
    </ProtectedRoute>
  );
}
