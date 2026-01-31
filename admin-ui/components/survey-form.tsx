'use client';

import { useState } from 'react';
import { Question, SurveyType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface SurveyFormData {
  title: string;
  description: string;
  questions: Omit<Question, 'id'>[];
}

interface SurveyFormProps {
  initialData?: SurveyFormData;
  onSubmit: (data: SurveyFormData) => Promise<void>;
  submitLabel: string;
}

export function SurveyForm({ initialData, onSubmit, submitLabel }: SurveyFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>(
    initialData?.questions || []
  );
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: SurveyType.TEXT,
        isRequired: false,
        order: questions.length,
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated[index].order = index;
    updated[newIndex].order = newIndex;
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    updated[questionIndex].options = [...options, ''];
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    options[optionIndex] = value;
    updated[questionIndex].options = options;
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    updated[questionIndex].options = options.filter((_, i) => i !== optionIndex);
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({ title, description, questions });
    } finally {
      setLoading(false);
    }
  };

  const requiresOptions = (type: SurveyType) => {
    return [SurveyType.CHECKBOX, SurveyType.RADIO, SurveyType.DROPDOWN].includes(type);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions</h3>
        <Button type="button" onClick={addQuestion} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.map((question, qIndex) => (
        <Card key={qIndex}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Question {qIndex + 1}</h4>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveQuestion(qIndex, 'up')}
                  disabled={qIndex === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveQuestion(qIndex, 'down')}
                  disabled={qIndex === questions.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(qIndex)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Input
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type *</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) =>
                    updateQuestion(qIndex, 'type', value as SurveyType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SurveyType.TEXT}>Text</SelectItem>
                    <SelectItem value={SurveyType.CHECKBOX}>Checkbox</SelectItem>
                    <SelectItem value={SurveyType.RADIO}>Radio</SelectItem>
                    <SelectItem value={SurveyType.DROPDOWN}>Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id={`required-${qIndex}`}
                  checked={question.isRequired}
                  onCheckedChange={(checked) =>
                    updateQuestion(qIndex, 'isRequired', checked)
                  }
                />
                <Label htmlFor={`required-${qIndex}`}>Required</Label>
              </div>
            </div>

            {requiresOptions(question.type) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Option
                  </Button>
                </div>
                {(question.options || []).map((option, oIndex) => (
                  <div key={oIndex} className="flex space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(qIndex, oIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || questions.length === 0}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
