import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// Mock @google/genai BEFORE any controller import.
//
// IMPORTANT: `jest.mock()` is hoisted to the top of the file by Jest at
// compile time, which means any variables defined in the outer scope (e.g.
// `const mockGenerateContent = jest.fn()`) are in the temporal dead zone
// when the factory runs and will throw:
//   "Cannot access 'mockGenerateContent' before initialization"
//
// The fix: define the mock fn INSIDE the factory, then retrieve it
// afterward by importing the mocked module and reading it off the instance.
// ---------------------------------------------------------------------------

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
}));

// Import controllers AFTER the mock is registered
import { ragSummaryHandler, ragQuizHandler, ragHealthHandler } from '../controllers/ragControllers.js';
import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Grab the shared mock fn from the instance the controller already created.
// GoogleGenAI was called once at module load time; its return value is the
// `ai` object the controller holds, so we reach in and get generateContent.
// ---------------------------------------------------------------------------
const mockGenerateContent = GoogleGenAI.mock.results[0].value.models.generateContent;

// ---------------------------------------------------------------------------
// Canned LLM responses
// ---------------------------------------------------------------------------

const MOCK_SUMMARY_RESPONSE = {
  text: JSON.stringify({
    title: 'Introduction to AI',
    bullets: [
      'AI simulates human intelligence in machines.',
      'Machine learning is a core subset of AI.',
      'Deep learning relies on multi-layered neural networks.',
    ],
    keyTerms: [
      { term: 'Artificial Intelligence', definition: 'Simulation of human intelligence by machines.' },
      { term: 'Machine Learning', definition: 'Systems that learn patterns from data.' },
      { term: 'Deep Learning', definition: 'ML using deep neural networks.' },
    ],
  }),
};

const MOCK_QUIZ_RESPONSE = {
  text: JSON.stringify({
    title: 'Photosynthesis Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What do plants convert sunlight into?',
        choices: [
          { id: 'A', text: 'Protein' },
          { id: 'B', text: 'Glucose' },
          { id: 'C', text: 'Starch' },
          { id: 'D', text: 'Cellulose' },
        ],
        answer: 'B',
        explanation: 'Plants produce glucose via photosynthesis.',
        difficulty: 'easy',
      },
      {
        id: 'q2',
        question: 'Which pigment absorbs light in chloroplasts?',
        choices: [
          { id: 'A', text: 'Melanin' },
          { id: 'B', text: 'Carotene' },
          { id: 'C', text: 'Chlorophyll' },
          { id: 'D', text: 'Hemoglobin' },
        ],
        answer: 'C',
        explanation: 'Chlorophyll is the primary light-absorbing pigment.',
        difficulty: 'easy',
      },
    ],
  }),
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const makeMockRes = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

const SAMPLE_NOTE_SUMMARY = {
  id: 'note_summary_01',
  text: 'Artificial intelligence (AI) is the simulation of human intelligence by machines. Machine learning is a subset of AI where systems learn from data. Deep learning uses neural networks with many layers.',
};

const SAMPLE_NOTE_QUIZ = {
  id: 'note_quiz_01',
  text: 'Photosynthesis is how plants convert sunlight into glucose using CO2 and water. Chlorophyll in chloroplasts absorbs light. The two stages are the light-dependent reactions and the Calvin cycle.',
};

// ---------------------------------------------------------------------------
// Reset mock state between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// ragHealthHandler
// ---------------------------------------------------------------------------

describe('ragHealthHandler', () => {
  it('returns 200 with the health payload', () => {
    const res = makeMockRes();

    ragHealthHandler({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'RAG API is healthy',
      error: null,
    });
  });
});

// ---------------------------------------------------------------------------
// ragSummaryHandler — input validation (no LLM calls)
// ---------------------------------------------------------------------------

describe('ragSummaryHandler – input validation', () => {
  let res;

  beforeEach(() => {
    res = makeMockRes();
  });

  it('returns 400 + missing-note when body has no note key', async () => {
    await ragSummaryHandler({ body: {} }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'note is required',
      error: 'missing-note',
      requestId: expect.stringMatching(/^req_/),
    });
  });

  it('returns 400 + missing-note when note is a primitive (not an object)', async () => {
    await ragSummaryHandler({ body: { note: 'just a string' } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-note' })
    );
  });

  it('returns 400 + missing-note-text when note object has no text field', async () => {
    await ragSummaryHandler({ body: { note: { id: 'n1' } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'note.text is required',
      error: 'missing-note-text',
      requestId: expect.stringMatching(/^req_/),
    });
  });

  it('returns 400 + missing-note-text when note.text is an empty string', async () => {
    await ragSummaryHandler({ body: { note: { text: '' } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-note-text' })
    );
  });

  it('returns 400 + missing-note-text when note.text is only whitespace', async () => {
    await ragSummaryHandler({ body: { note: { text: '   ' } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-note-text' })
    );
  });

  it('returns 400 + missing-note-text when note.text is not a string', async () => {
    await ragSummaryHandler({ body: { note: { text: 42 } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-note-text' })
    );
  });
});

// ---------------------------------------------------------------------------
// ragSummaryHandler — LLM behaviour (mocked)
// ---------------------------------------------------------------------------

describe('ragSummaryHandler – LLM behaviour', () => {
  it('returns 200 with a well-formed summary when the LLM succeeds', async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_SUMMARY_RESPONSE);

    const res = makeMockRes();
    await ragSummaryHandler({ body: { note: SAMPLE_NOTE_SUMMARY } }, res);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.message).toBe('Summary generated successfully');
    expect(payload.error).toBeNull();
    expect(payload.requestId).toMatch(/^req_/);
    expect(payload.noteId).toBe(SAMPLE_NOTE_SUMMARY.id);
    expect(payload.type).toBe('summary');

    const { summary } = payload;
    expect(typeof summary.title).toBe('string');
    expect(summary.title.length).toBeGreaterThan(0);
    expect(Array.isArray(summary.bullets)).toBe(true);
    expect(summary.bullets.length).toBeGreaterThanOrEqual(3);
    summary.bullets.forEach((b) => expect(typeof b).toBe('string'));
    expect(Array.isArray(summary.keyTerms)).toBe(true);
    summary.keyTerms.forEach((kt) => {
      expect(typeof kt.term).toBe('string');
      expect(typeof kt.definition).toBe('string');
    });
  });

  it('sets noteId to null when note has no id field', async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_SUMMARY_RESPONSE);

    const res = makeMockRes();
    await ragSummaryHandler({ body: { note: { text: SAMPLE_NOTE_SUMMARY.text } } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].noteId).toBeNull();
  });

  it('passes the prompt to the LLM and includes note text in it', async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_SUMMARY_RESPONSE);

    const res = makeMockRes();
    await ragSummaryHandler({ body: { note: SAMPLE_NOTE_SUMMARY } }, res);

    const calledPrompt = mockGenerateContent.mock.calls[0][0].contents;
    expect(calledPrompt).toContain(SAMPLE_NOTE_SUMMARY.text);
  });

  it('returns 500 + llm-failed when the LLM throws', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Network timeout'));

    const res = makeMockRes();
    await ragSummaryHandler({ body: { note: SAMPLE_NOTE_SUMMARY } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to generate summary',
      error: 'llm-failed',
      details: 'Network timeout',
      requestId: expect.stringMatching(/^req_/),
    });
  });

  it('returns 500 + llm-failed when the LLM returns unparseable text', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'this is not json {{{' });

    const res = makeMockRes();
    await ragSummaryHandler({ body: { note: SAMPLE_NOTE_SUMMARY } }, res);

    // JSON.parse throws → caught by the try/catch → llm-failed
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'llm-failed' })
    );
  });

  it('strips markdown code fences from LLM output before parsing', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '```json\n' + MOCK_SUMMARY_RESPONSE.text + '\n```',
    });

    const res = makeMockRes();
    await ragSummaryHandler({ body: { note: SAMPLE_NOTE_SUMMARY } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].summary.title).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ragQuizHandler — input validation (no LLM calls)
// ---------------------------------------------------------------------------

describe('ragQuizHandler – input validation', () => {
  let res;

  beforeEach(() => {
    res = makeMockRes();
  });

  it('returns 400 + missing-note when body has no note key', async () => {
    await ragQuizHandler({ body: {} }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-note' })
    );
  });

  it('returns 400 + missing-note-text when note.text is empty', async () => {
    await ragQuizHandler({ body: { note: { text: '' } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-note-text' })
    );
  });

  it('returns 400 + invalid-options when numQuestions is below minimum (0)', async () => {
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ, options: { numQuestions: 0 } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid quiz options',
      error: 'invalid-options',
      requestId: expect.stringMatching(/^req_/),
    });
  });

  it('returns 400 + invalid-options when numQuestions exceeds maximum (50)', async () => {
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ, options: { numQuestions: 50 } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'invalid-options' })
    );
  });

  it('returns 400 + invalid-options when numChoices is below minimum (1)', async () => {
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ, options: { numChoices: 1 } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'invalid-options' })
    );
  });

  it('returns 400 + invalid-options when numChoices exceeds maximum (7)', async () => {
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ, options: { numChoices: 7 } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'invalid-options' })
    );
  });

  it('returns 400 + invalid-options for an unrecognised difficulty value', async () => {
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ, options: { difficulty: 'extreme' } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'invalid-options' })
    );
  });

  it('returns 400 + invalid-options when numQuestions is a non-numeric string', async () => {
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ, options: { numQuestions: 'ten' } } }, res);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'invalid-options' })
    );
  });
});

// ---------------------------------------------------------------------------
// ragQuizHandler — LLM behaviour (mocked)
// ---------------------------------------------------------------------------

describe('ragQuizHandler – LLM behaviour', () => {
  it('returns 200 with a well-formed quiz when the LLM succeeds', async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_QUIZ_RESPONSE);

    const res = makeMockRes();
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ } }, res);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.message).toBe('Quiz generated successfully');
    expect(payload.error).toBeNull();
    expect(payload.requestId).toMatch(/^req_/);
    expect(payload.noteId).toBe(SAMPLE_NOTE_QUIZ.id);
    expect(payload.type).toBe('quiz');

    const { quiz } = payload;
    expect(typeof quiz.title).toBe('string');
    expect(Array.isArray(quiz.questions)).toBe(true);
    expect(quiz.questions.length).toBeGreaterThanOrEqual(1);

    quiz.questions.forEach((q) => {
      expect(typeof q.id).toBe('string');
      expect(typeof q.question).toBe('string');
      expect(Array.isArray(q.choices)).toBe(true);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      q.choices.forEach((c) => {
        expect(typeof c.id).toBe('string');
        expect(typeof c.text).toBe('string');
      });
      const choiceIds = q.choices.map((c) => c.id);
      expect(choiceIds).toContain(q.answer);
      expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
    });
  });

  it('sets noteId to null when note has no id field', async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_QUIZ_RESPONSE);

    const res = makeMockRes();
    await ragQuizHandler({ body: { note: { text: SAMPLE_NOTE_QUIZ.text }, options: { numQuestions: 2 } } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].noteId).toBeNull();
  });

  it('passes the prompt to the LLM and includes note text in it', async () => {
    mockGenerateContent.mockResolvedValueOnce(MOCK_QUIZ_RESPONSE);

    const res = makeMockRes();
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ } }, res);

    const calledPrompt = mockGenerateContent.mock.calls[0][0].contents;
    expect(calledPrompt).toContain(SAMPLE_NOTE_QUIZ.text);
  });

  it('returns 500 + llm-failed when the LLM throws', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Rate limit exceeded'));

    const res = makeMockRes();
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to generate quiz',
      error: 'llm-failed',
      details: 'Rate limit exceeded',
      requestId: expect.stringMatching(/^req_/),
    });
  });

  it('returns 500 + invalid-llm-json when the LLM returns a valid JSON object missing the questions array', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ title: 'Broken quiz' }), // missing `questions`
    });

    const res = makeMockRes();
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'invalid-llm-json' })
    );
  });

  it('strips markdown code fences from LLM output before parsing', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: '```json\n' + MOCK_QUIZ_RESPONSE.text + '\n```',
    });

    const res = makeMockRes();
    await ragQuizHandler({ body: { note: SAMPLE_NOTE_QUIZ } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].quiz.title).toBeDefined();
  });
});