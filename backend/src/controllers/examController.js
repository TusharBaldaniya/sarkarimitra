const crypto = require('crypto');
const prisma = require('../utils/prisma');

// Helper to determine live exam status
const computeExamStatus = (exam) => {
  if (!exam.isActive) return 'Disabled';
  const now = new Date();
  const startAt = new Date(exam.startAt);
  const endAt = new Date(exam.endAt);

  if (now < startAt) return 'Upcoming';
  if (now > endAt) return 'Expired';
  return 'Active';
};

// List all exams for Admin dashboard
const getExams = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const statusFilter = req.query.status ? req.query.status.trim() : '';

    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [rawExams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              examQuestions: true,
              attempts: true,
            },
          },
        },
      }),
      prisma.exam.count({ where }),
    ]);

    const formattedExams = rawExams.map((exam) => {
      const status = computeExamStatus(exam);
      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        publicToken: exam.publicToken,
        startAt: exam.startAt,
        endAt: exam.endAt,
        durationMinutes: exam.durationMinutes,
        isActive: exam.isActive,
        showAnswersToStudent: exam.showAnswersToStudent,
        allowPractice: exam.allowPractice,
        status,
        questionCount: exam._count.examQuestions,
        attemptCount: exam._count.attempts,
        createdAt: exam.createdAt,
      };
    });

    // Apply status filter if provided
    let filtered = formattedExams;
    if (statusFilter && statusFilter !== 'All') {
      filtered = formattedExams.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase());
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      data: filtered,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exams.',
    });
  }
};

// Get single exam details for Admin
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        examQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: true,
          },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    const status = computeExamStatus(exam);

    return res.json({
      success: true,
      data: {
        ...exam,
        status,
        attemptCount: exam._count.attempts,
        questions: exam.examQuestions.map((eq) => ({
          ...eq.question,
          questionOrder: eq.questionOrder,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exam details.',
    });
  }
};

// Create a new exam
const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      startAt,
      endAt,
      durationMinutes,
      showAnswersToStudent,
      questionIds, // Array of question ID strings in desired order
    } = req.body;

    if (!title || !startAt || !endAt || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Title, start date, end date, and duration are required.',
      });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start or end date format.',
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date/time must be after start date/time.',
      });
    }

    if (parseInt(durationMinutes, 10) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be greater than 0 minutes.',
      });
    }

    // Generate secure random public token
    const publicToken = crypto.randomBytes(12).toString('hex');

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        publicToken,
        startAt: startDate,
        endAt: endDate,
        durationMinutes: parseInt(durationMinutes, 10),
        showAnswersToStudent: showAnswersToStudent !== undefined ? Boolean(showAnswersToStudent) : true,
        allowPractice: req.body.allowPractice !== undefined ? Boolean(req.body.allowPractice) : true,
        isActive: true,
      },
    });

    // Add selected questions with ordering if provided
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const examQuestionData = questionIds.map((qId, index) => ({
        examId: exam.id,
        questionId: qId,
        questionOrder: index + 1,
      }));

      await prisma.examQuestion.createMany({
        data: examQuestionData,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Exam created successfully.',
      data: {
        ...exam,
        publicToken,
      },
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create exam.',
    });
  }
};

// Update an existing exam
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startAt,
      endAt,
      durationMinutes,
      isActive,
      showAnswersToStudent,
      questionIds,
    } = req.body;

    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    let startDate = existing.startAt;
    let endDate = existing.endAt;

    if (startAt) startDate = new Date(startAt);
    if (endAt) endDate = new Date(endAt);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.',
      });
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        startAt: startDate,
        endAt: endDate,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes, 10) : existing.durationMinutes,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        showAnswersToStudent: showAnswersToStudent !== undefined ? Boolean(showAnswersToStudent) : existing.showAnswersToStudent,
        allowPractice: req.body.allowPractice !== undefined ? Boolean(req.body.allowPractice) : existing.allowPractice,
      },
    });

    // Update question associations if questionIds array is provided
    if (Array.isArray(questionIds)) {
      // Remove old relations
      await prisma.examQuestion.deleteMany({ where: { examId: id } });

      // Create new relations
      if (questionIds.length > 0) {
        const examQuestionData = questionIds.map((qId, index) => ({
          examId: id,
          questionId: qId,
          questionOrder: index + 1,
        }));

        await prisma.examQuestion.createMany({
          data: examQuestionData,
        });
      }
    }

    return res.json({
      success: true,
      message: 'Exam updated successfully.',
      data: updatedExam,
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update exam.',
    });
  }
};

// Toggle exam active status
const toggleExamStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.json({
      success: true,
      message: `Exam ${updated.isActive ? 'enabled' : 'disabled'} successfully.`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update exam status.',
    });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.exam.findUnique({
      where: { id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    await prisma.exam.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Exam deleted successfully.',
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete exam.',
    });
  }
};

// Get Exam Results leaderboard for Admin
const getExamResults = async (req, res) => {
  try {
    const { id } = req.params;
    const search = req.query.search ? req.query.search.trim() : '';

    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { id: true, title: true, durationMinutes: true },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    const whereAttempt = {
      examId: id,
    };

    if (search) {
      whereAttempt.studentName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const attempts = await prisma.examAttempt.findMany({
      where: whereAttempt,
      orderBy: [
        { score: 'desc' },
        { submittedAt: 'asc' },
      ],
    });

    // Calculate aggregated statistics
    const totalAttempts = attempts.length;
    let totalScore = 0;
    let highestScore = 0;

    attempts.forEach((att) => {
      totalScore += att.score;
      if (att.score > highestScore) highestScore = att.score;
    });

    const averageScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0;

    // Format with rank
    const rankedAttempts = attempts.map((att, idx) => ({
      rank: idx + 1,
      attemptId: att.id,
      studentName: att.studentName,
      score: att.score,
      totalQuestions: att.totalQuestions,
      percentage: att.percentage,
      status: att.status,
      startedAt: att.startedAt,
      submittedAt: att.submittedAt,
    }));

    return res.json({
      success: true,
      data: {
        exam,
        stats: {
          totalAttempts,
          averageScore: parseFloat(averageScore),
          highestScore,
        },
        attempts: rankedAttempts,
      },
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exam results.',
    });
  }
};

// Get detailed student attempt results for Admin
const getAttemptDetails = async (req, res) => {
  try {
    const { id, attemptId } = req.params;

    const attempt = await prisma.examAttempt.findFirst({
      where: { id: attemptId, examId: id },
      include: {
        exam: {
          select: { title: true, durationMinutes: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found.',
      });
    }

    // Also get all questions for this exam to show unanswered ones if needed
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId: id },
      orderBy: { questionOrder: 'asc' },
      include: { question: true },
    });

    const answerMap = new Map();
    attempt.answers.forEach((ans) => {
      answerMap.set(ans.questionId, ans);
    });

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const questionBreakdown = examQuestions.map((eq) => {
      const q = eq.question;
      const ans = answerMap.get(q.id);
      const selectedAnswer = ans ? ans.selectedAnswer : null;
      const isCorrect = ans ? ans.isCorrect : false;

      if (!selectedAnswer) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        questionOrder: eq.questionOrder,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        selectedAnswer,
        isCorrect,
      };
    });

    return res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        studentName: attempt.studentName,
        examTitle: attempt.exam.title,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        correctCount,
        wrongCount,
        unansweredCount,
        questions: questionBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attempt details.',
    });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  toggleExamStatus,
  deleteExam,
  getExamResults,
  getAttemptDetails,
};
