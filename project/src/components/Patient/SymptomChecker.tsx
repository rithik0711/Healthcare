import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { SymptomQuestion, SymptomResponse } from '../../types';
import { api } from '../../services/api';

interface SymptomCheckerProps {
  onComplete: () => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<SymptomQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SymptomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    specialty: string;
    urgency: 'low' | 'medium' | 'high';
    recommendation: string;
  } | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await api.getSymptomQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (answer: string | string[] | number) => {
    const newResponse: SymptomResponse = {
      questionId: questions[currentQuestionIndex].id,
      answer
    };

    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== newResponse.questionId);
      return [...filtered, newResponse];
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      analyzeSymptoms([...responses.filter(r => r.questionId !== newResponse.questionId), newResponse]);
    }
  };

  const analyzeSymptoms = async (allResponses: SymptomResponse[]) => {
    setAnalyzing(true);
    try {
      const analysis = await api.analyzeSymptoms(allResponses);
      setResult(analysis);
    } catch (error) {
      console.error('Failed to analyze symptoms:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const restart = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Symptoms</h2>
        <p className="text-gray-600 mb-4">Our AI is processing your responses...</p>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            result.urgency === 'high' ? 'bg-red-100' : 
            result.urgency === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            {result.urgency === 'high' ? (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete</h2>
        </div>

        <div className="space-y-6">
          <div className={`border-l-4 p-4 rounded-lg ${
            result.urgency === 'high' ? 'border-red-500 bg-red-50' :
            result.urgency === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-2">Recommended Specialty</h3>
            <p className="text-lg font-medium">{result.specialty}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Recommendation</h3>
            <p className="text-gray-700">{result.recommendation}</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onComplete}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Book Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={restart}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestion.id);

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">AI Symptom Checker</h2>
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">{currentQuestion.question}</h3>

        {currentQuestion.type === 'single' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map(option => (
              <button
                key={option}
                onClick={() => handleResponse(option)}
                className={`w-full p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors ${
                  currentResponse?.answer === option ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'multiple' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map(option => {
              const selectedOptions = (currentResponse?.answer as string[]) || [];
              const isSelected = selectedOptions.includes(option);
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    const newOptions = isSelected
                      ? selectedOptions.filter(o => o !== option)
                      : [...selectedOptions, option];
                    handleResponse(newOptions);
                  }}
                  className={`w-full p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {option}
                  </div>
                </button>
              );
            })}
            {currentResponse && (currentResponse.answer as string[]).length > 0 && (
              <button
                onClick={() => handleResponse((currentResponse.answer as string[]) || [])}
                className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {currentQuestion.type === 'scale' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>No Pain (1)</span>
              <span>Severe Pain (10)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={(currentResponse?.answer as number) || 5}
              onChange={(e) => handleResponse(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {(currentResponse?.answer as number) || 5}
              </span>
            </div>
            <button
              onClick={() => handleResponse((currentResponse?.answer as number) || 5)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {currentQuestionIndex > 0 && (
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous Question
        </button>
      )}
    </div>
  );
};