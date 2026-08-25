const prisma = require('../utils/prisma');

// Validate exam public availability status
const validateExamAvailability = (exam, isPracticeMode = false) => {
  if (!exam) {
    return { valid: false, code: 'NOT_FOUND', message: 'Exam not found. Invalid exam link.' };
  }

  if (!exam.isActive) {
    return { valid: false, code: 'DISABLED', message: 'This exam has been disabled by the administrator.' };
  }

  const now = new Date();
  const startAt = new Date(exam.startAt);
  const endAt = new Date(exam.endAt);

  if (now < startAt) {
    return {
      valid: false,
      code: 'UPCOMING',
      message: `Exam is not active yet. It will start on ${startAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
      startAt: exam.startAt,
    };
  }

  // If exam has passed endAt date:
  if (now > endAt) {
    if (exam.allowPractice || isPracticeMode) {
      return {
        valid: true,
        isPracticeMode: true,
        message: 'Live test window has ended. You are taking this exam in Practice Mode.',
      };
    }
    return {
      valid: false,
      code: 'EXPIRED',
      message: 'This exam has expired and is no longer accepting practice attempts.',
      endAt: exam.endAt,
    };
  }

  return { valid: true, isPracticeMode: Boolean(isPracticeMode) };
};

// GET /api/public/exams/practice/list - Public endpoint to list all approved practice exams
const getPublicPracticeExams = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';

    const now = new Date();

    const where = {
      isActive: true,
      allowPractice: true,
      endAt: { lt: now }, // Only past/completed exams whose endAt window has expired
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const rawExams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            examQuestions: true,
            attempts: true,
          },
        },
      },
    });

    const now = new Date();

    const practiceExams = rawExams.map((exam) => {
      const isExpired = now > new Date(exam.endAt);
      const isUpcoming = now < new Date(exam.startAt);

      let statusBadge = 'PRACTICE_AVAILABLE';
      if (isUpcoming) statusBadge = 'UPCOMING';
      else if (!isExpired) statusBadge = 'LIVE_NOW';

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        publicToken: exam.publicToken,
        durationMinutes: exam.durationMinutes,
        startAt: exam.startAt,
        endAt: exam.endAt,
        isExpired,
        isUpcoming,
        statusBadge,
        questionCount: exam._count.examQuestions,
        totalAttempts: exam._count.attempts,
      };
    });

    return res.json({
      success: true,
      data: practiceExams,
    });
  } catch (error) {
    console.error('Error fetching practice exams:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch practice exams list.',
    });
  }
};

// GET /api/public/exams/:token - Fetch exam info for student start page
const getPublicExamInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const isPracticeRequested = req.query.practice === 'true';

    const exam = await prisma.exam.findUnique({
      where: { publicToken: token },
      include: {
        _count: {
          select: { examQuestions: true },
        },
      },
    });

    const statusCheck = validateExamAvailability(exam, isPracticeRequested);
    if (!statusCheck.valid) {
      return res.status(400).json({
        success: false,
        code: statusCheck.code,
        message: statusCheck.message,
        data: statusCheck.startAt ? { startAt: statusCheck.startAt } : null,
      });
    }

    return res.json({
      success: true,
      data: {
        title: exam.title,
        description: exam.description,
        questionCount: exam._count.examQuestions,
        durationMinutes: exam.durationMinutes,
        startAt: exam.startAt,
        endAt: exam.endAt,
        showAnswersToStudent: exam.showAnswersToStudent,
        allowPractice: exam.allowPractice,
        isPracticeMode: statusCheck.isPracticeMode || false,
      },
    });
  } catch (error) {
    console.error('Error fetching public exam:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exam details.',
    });
  }
};

// POST /api/public/exams/:token/start - Student starts exam (Live or Practice)
const startPublicExam = async (req, res) => {
  try {
    const { token } = req.params;
    const { studentName, deviceId, isPractice } = req.body;

    if (!studentName || typeof studentName !== 'string' || studentName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid student name (at least 2 characters).',
      });
    }

    const trimmedName = studentName.trim();
    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Student name must not exceed 100 characters.',
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { publicToken: token },
      include: {
        examQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: true,
          },
        },
      },
    });

    const statusCheck = validateExamAvailability(exam, isPractice);
    if (!statusCheck.valid) {
      return res.status(400).json({
        success: false,
        code: statusCheck.code,
        message: statusCheck.message,
      });
    }

    if (exam.examQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This exam currently has no questions assigned.',
      });
    }

    const isPracticeAttempt = statusCheck.isPracticeMode || Boolean(isPractice);

    // Create ExamAttempt record
    const startedAt = new Date();
    const attempt = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentName: trimmedName,
        deviceId: deviceId ? deviceId.trim() : null,
        isPractice: isPracticeAttempt,
        startedAt,
        totalQuestions: exam.examQuestions.length,
        status: 'IN_PROGRESS',
      },
    });

    // Strip out correctAnswer and explanation from question payload sent to student
    const sanitizedQuestions = exam.examQuestions.map((eq) => ({
      id: eq.question.id,
      questionOrder: eq.questionOrder,
      questionText: eq.question.questionText,
      optionA: eq.question.optionA,
      optionB: eq.question.optionB,
      optionC: eq.question.optionC,
      optionD: eq.question.optionD,
      category: eq.question.category,
    }));

    return res.json({
      success: true,
      message: isPracticeAttempt ? 'Practice test started.' : 'Exam started successfully.',
      data: {
        attemptId: attempt.id,
        studentName: attempt.studentName,
        examTitle: exam.title,
        durationMinutes: exam.durationMinutes,
        isPracticeMode: isPracticeAttempt,
        startedAt: attempt.startedAt,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start exam.',
    });
  }
};

// POST /api/public/exams/:token/submit - Submit student answers and calculate result
const submitPublicExam = async (req, res) => {
  try {
    const { token } = req.params;
    const { attemptId, answers, isAutoSubmit } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID is required for submission.',
      });
    }

    const exam = await prisma.exam.findUnique({
      where: { publicToken: token },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    const attempt = await prisma.examAttempt.findFirst({
      where: { id: attemptId, examId: exam.id },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt session not found.',
      });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'This exam attempt has already been submitted.',
      });
    }

    // Fetch questions assigned to this exam
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId: exam.id },
      orderBy: { questionOrder: 'asc' },
      include: {
        question: true,
      },
    });

    // Normalize student answers input
    const answerMap = new Map();
    if (Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (ans.questionId && ans.selectedAnswer) {
          answerMap.set(ans.questionId, ans.selectedAnswer.toUpperCase().trim());
        }
      });
    } else if (answers && typeof answers === 'object') {
      Object.keys(answers).forEach((qId) => {
        if (answers[qId]) {
          answerMap.set(qId, answers[qId].toUpperCase().trim());
        }
      });
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const attemptAnswersToCreate = [];
    const questionResults = [];

    examQuestions.forEach((eq) => {
      const q = eq.question;
      const selected = answerMap.get(q.id) || null;
      let isCorrect = false;

      if (!selected) {
        unansweredCount++;
      } else if (selected === q.correctAnswer) {
        isCorrect = true;
        score += 1;
        correctCount++;
      } else {
        wrongCount++;
      }

      attemptAnswersToCreate.push({
        attemptId: attempt.id,
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect,
      });

      questionResults.push({
        questionId: q.id,
        questionOrder: eq.questionOrder,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const totalQuestions = examQuestions.length;
    const percentage = totalQuestions > 0 ? parseFloat(((score / totalQuestions) * 100).toFixed(2)) : 0;
    const submittedAt = new Date();
    const finalStatus = isAutoSubmit ? 'AUTO_SUBMITTED' : 'SUBMITTED';

    // Transaction to save answers and update attempt
    await prisma.$transaction([
      prisma.attemptAnswer.createMany({
        data: attemptAnswersToCreate,
      }),
      prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          submittedAt,
          score,
          totalQuestions,
          percentage,
          status: finalStatus,
        },
      }),
    ]);

    // For practice attempts, always display answer key & explanations to student!
    const shouldShowAnswers = attempt.isPractice || exam.showAnswersToStudent;

    return res.json({
      success: true,
      message: 'Exam submitted successfully.',
      data: {
        attemptId: attempt.id,
        studentName: attempt.studentName,
        examTitle: exam.title,
        score,
        totalQuestions,
        percentage,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        submittedAt,
        status: finalStatus,
        isPracticeMode: attempt.isPractice,
        showAnswersToStudent: shouldShowAnswers,
        questions: shouldShowAnswers ? questionResults : null,
      },
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit exam.',
    });
  }
};

module.exports = {
  getPublicPracticeExams,
  getPublicExamInfo,
  startPublicExam,
  submitPublicExam,
};
