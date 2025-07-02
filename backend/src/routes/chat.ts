import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../services/database.service';
import { ClaudeService, ChatRequest } from '../services/claude.service';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Validation middleware
const validateChatMessage = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('conversationHistory')
    .optional()
    .isArray()
    .withMessage('Conversation history must be an array'),
  body('conversationHistory.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('Message role must be either "user" or "assistant"'),
  body('conversationHistory.*.content')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message content is required'),
];

const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message: errors.array().map(err => err.msg).join(', ')
    };
    return res.status(400).json(response);
  }
  next();
};

export function createChatRouter(dbService: DatabaseService): Router {
  const router = Router();
  
  // Initialize Claude service
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set - chat functionality will be disabled');
  }
  
  let claudeService: ClaudeService | null = null;
  if (apiKey) {
    try {
      claudeService = new ClaudeService(dbService, apiKey);
    } catch (error) {
      console.error('Failed to initialize Claude service:', error);
    }
  }

  // POST /api/chat - Send a message to the AI
  router.post('/', validateChatMessage, handleValidationErrors, async (req: Request, res: Response) => {
    if (!claudeService) {
      const response: ApiResponse = {
        success: false,
        error: 'Service unavailable',
        message: 'AI chat service is not configured. Please set ANTHROPIC_API_KEY environment variable.'
      };
      return res.status(503).json(response);
    }

    try {
      const chatRequest: ChatRequest = {
        message: req.body.message,
        conversationHistory: req.body.conversationHistory || []
      };

      const aiResponse = await claudeService.processMessage(chatRequest);

      const response: ApiResponse = {
        success: true,
        data: {
          message: aiResponse.response,
          context: aiResponse.context,
          timestamp: aiResponse.timestamp
        },
        message: 'Message processed successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Error processing chat message:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process your message. Please try again.'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/chat/health - Check if AI service is available
  router.get('/health', async (req: Request, res: Response) => {
    if (!claudeService) {
      const response: ApiResponse = {
        success: false,
        error: 'Service unavailable',
        message: 'AI chat service is not configured'
      };
      return res.status(503).json(response);
    }

    try {
      const isHealthy = await claudeService.testConnection();
      
      if (isHealthy) {
        const response: ApiResponse = {
          success: true,
          message: 'AI chat service is available'
        };
        res.json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          error: 'Service unhealthy',
          message: 'AI chat service is not responding correctly'
        };
        res.status(503).json(response);
      }
    } catch (error) {
      console.error('Error checking AI service health:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to check AI service health'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/chat/examples - Get example queries
  router.get('/examples', (req: Request, res: Response) => {
    const examples = [
      {
        category: 'Airline Features',
        queries: [
          'Which airlines support dynamic pricing?',
          'Does American Airlines have seat selection?',
          'What features are available for United Airlines?'
        ]
      },
      {
        category: 'Feature Comparison',
        queries: [
          'Compare baggage options across all airlines',
          'Which airlines offer pet transportation?',
          'Show me all airlines with unaccompanied minor support'
        ]
      },
      {
        category: 'Provider Information',
        queries: [
          'List all airlines using Sabre provider',
          'What providers are used by European airlines?',
          'Compare features across Altea NDC airlines'
        ]
      },
      {
        category: 'Status Queries',
        queries: [
          'Which features are in pilot status?',
          'Show production-ready airlines',
          'What features are not yet implemented?'
        ]
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: examples,
      message: 'Example queries retrieved successfully'
    };

    res.json(response);
  });

  return router;
}