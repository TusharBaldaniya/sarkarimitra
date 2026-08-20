const { parse } = require('csv-parse/sync');
const prisma = require('../utils/prisma');

// List questions with pagination, search, and category/difficulty filters
const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const category = req.query.category ? req.query.category.trim() : '';
    const difficulty = req.query.difficulty ? req.query.difficulty.trim() : '';

    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.questionText = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      where.difficulty = difficulty;
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch questions.',
    });
  }
};

// Get single question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    return res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch question.',
    });
  }
};

// Create a new question
const createQuestion = async (req, res) => {
  try {
    const {
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      category,
      difficulty,
      explanation,
    } = req.body;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question text, 4 options, and correct answer are required.',
      });
    }

    const validAnswers = ['A', 'B', 'C', 'D'];
    const formattedCorrect = correctAnswer.toUpperCase().trim();
    if (!validAnswers.includes(formattedCorrect)) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer must be one of: A, B, C, D.',
      });
    }

    const question = await prisma.question.create({
      data: {
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer: formattedCorrect,
        category: category ? category.trim() : 'General Knowledge',
        difficulty: difficulty ? difficulty.trim() : 'Medium',
        explanation: explanation ? explanation.trim() : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      data: question,
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create question.',
    });
  }
};

// Update question by ID
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      category,
      difficulty,
      explanation,
    } = req.body;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    let formattedCorrect = existing.correctAnswer;
    if (correctAnswer) {
      formattedCorrect = correctAnswer.toUpperCase().trim();
      if (!['A', 'B', 'C', 'D'].includes(formattedCorrect)) {
        return res.status(400).json({
          success: false,
          message: 'Correct answer must be one of: A, B, C, D.',
        });
      }
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        questionText: questionText !== undefined ? questionText.trim() : existing.questionText,
        optionA: optionA !== undefined ? optionA.trim() : existing.optionA,
        optionB: optionB !== undefined ? optionB.trim() : existing.optionB,
        optionC: optionC !== undefined ? optionC.trim() : existing.optionC,
        optionD: optionD !== undefined ? optionD.trim() : existing.optionD,
        correctAnswer: formattedCorrect,
        category: category !== undefined ? category.trim() : existing.category,
        difficulty: difficulty !== undefined ? difficulty.trim() : existing.difficulty,
        explanation: explanation !== undefined ? (explanation ? explanation.trim() : null) : existing.explanation,
      },
    });

    return res.json({
      success: true,
      message: 'Question updated successfully.',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update question.',
    });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    await prisma.question.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete question.',
    });
  }
};

// Bulk Import Questions from CSV text or array
const importQuestions = async (req, res) => {
  try {
    const { csvContent, questionsData } = req.body;

    let rows = [];

    if (csvContent && typeof csvContent === 'string') {
      try {
        rows = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV format. Please ensure CSV headers match requirement.',
        });
      }
    } else if (Array.isArray(questionsData)) {
      rows = questionsData;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either csvContent string or questionsData array must be provided.',
      });
    }

    const totalRows = rows.length;
    const validRows = [];
    const invalidRows = [];

    const validAnswers = ['A', 'B', 'C', 'D'];

    rows.forEach((row, index) => {
      const rowIndex = index + 1;
      const questionText = row.questionText || row.question || '';
      const optionA = row.optionA || row.option_a || '';
      const optionB = row.optionB || row.option_b || '';
      const optionC = row.optionC || row.option_c || '';
      const optionD = row.optionD || row.option_d || '';
      const correctAnswer = (row.correctAnswer || row.correct_answer || '').toString().toUpperCase().trim();
      const category = row.category || 'General Knowledge';
      const difficulty = row.difficulty || 'Medium';
      const explanation = row.explanation || null;

      const errors = [];
      if (!questionText) errors.push('Missing questionText');
      if (!optionA) errors.push('Missing optionA');
      if (!optionB) errors.push('Missing optionB');
      if (!optionC) errors.push('Missing optionC');
      if (!optionD) errors.push('Missing optionD');
      if (!validAnswers.includes(correctAnswer)) errors.push(`Invalid correctAnswer "${correctAnswer}". Must be A, B, C, or D`);

      if (errors.length === 0) {
        validRows.push({
          questionText: questionText.trim(),
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          optionC: optionC.trim(),
          optionD: optionD.trim(),
          correctAnswer,
          category: category.trim(),
          difficulty: difficulty.trim(),
          explanation: explanation ? explanation.trim() : null,
        });
      } else {
        invalidRows.push({
          row: rowIndex,
          data: row,
          reasons: errors,
        });
      }
    });

    let importedCount = 0;
    if (validRows.length > 0) {
      const created = await prisma.question.createMany({
        data: validRows,
      });
      importedCount = created.count;
    }

    return res.json({
      success: true,
      message: `Processed ${totalRows} rows. Successfully imported ${importedCount} questions.`,
      summary: {
        totalRows,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        importedCount,
        invalidRows,
      },
    });
  } catch (error) {
    console.error('Error importing questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to import questions.',
    });
  }
};

// Bulk delete questions
const bulkDeleteQuestions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question IDs array is required for bulk delete.',
      });
    }

    const deleted = await prisma.question.deleteMany({
      where: { id: { in: ids } },
    });

    return res.json({
      success: true,
      message: `Successfully deleted ${deleted.count} questions.`,
      count: deleted.count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk delete questions.',
    });
  }
};

// Bulk update category for questions
const bulkUpdateCategory = async (req, res) => {
  try {
    const { ids, category } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !category) {
      return res.status(400).json({
        success: false,
        message: 'Question IDs array and target category are required.',
      });
    }

    const updated = await prisma.question.updateMany({
      where: { id: { in: ids } },
      data: { category: category.trim() },
    });

    return res.json({
      success: true,
      message: `Successfully updated category for ${updated.count} questions.`,
      count: updated.count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk update question category.',
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions,
  bulkDeleteQuestions,
  bulkUpdateCategory,
};
