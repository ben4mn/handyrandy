import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database.service';
import { CreateAirlineRequest, UpdateAirlineRequest, ApiResponse, ValidationError, NotFoundError, DatabaseError } from '../types';
import { body, param, validationResult } from 'express-validator';

export function createAirlinesRouter(dbService: DatabaseService): Router {
  const router = Router();

  // Validation middleware
  const validateCreateAirline = [
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name is required and must be less than 255 characters'),
    body('codes')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Codes are required and must be less than 100 characters'),
    body('provider')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Provider is required and must be less than 255 characters'),
    body('status')
      .isIn(['Production', 'Pilot', 'Development', 'Inactive'])
      .withMessage('Status must be one of: Production, Pilot, Development, Inactive'),
  ];

  const validateUpdateAirline = [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be less than 255 characters'),
    body('codes')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Codes must be less than 100 characters'),
    body('provider')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Provider must be less than 255 characters'),
    body('status')
      .optional()
      .isIn(['Production', 'Pilot', 'Development', 'Inactive'])
      .withMessage('Status must be one of: Production, Pilot, Development, Inactive'),
  ];

  const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  ];

  // Error handling middleware
  const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: errors.array().map(err => err.msg).join(', ')
      };
      res.status(400).json(response);
      return;
    }
    next();
  };

  // GET /api/airlines - Get all airlines
  router.get('/', async (req: Request, res: Response) => {
    try {
      const airlines = await dbService.getAllAirlines();
      const response: ApiResponse = {
        success: true,
        data: airlines,
        message: `Found ${airlines.length} airlines`
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching airlines:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch airlines'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/airlines/:id - Get airline by ID
  router.get('/:id', validateId, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const airline = await dbService.getAirlineById(id);
      const response: ApiResponse = {
        success: true,
        data: airline
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching airline:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch airline'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/airlines/:id/implementations - Get airline with implementations
  router.get('/:id/implementations', validateId, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const airlineWithImplementations = await dbService.getAirlineWithImplementations(id);
      const response: ApiResponse = {
        success: true,
        data: airlineWithImplementations
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching airline with implementations:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch airline with implementations'
      };
      res.status(500).json(response);
    }
  });

  // POST /api/airlines - Create new airline
  router.post('/', validateCreateAirline, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const airlineData: CreateAirlineRequest = req.body;
      const newAirline = await dbService.createAirline(airlineData);
      const response: ApiResponse = {
        success: true,
        data: newAirline,
        message: 'Airline created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating airline:', error);
      
      if (error instanceof DatabaseError && error.message.includes('UNIQUE constraint')) {
        const response: ApiResponse = {
          success: false,
          error: 'Conflict',
          message: 'An airline with this name already exists'
        };
        return res.status(409).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create airline'
      };
      res.status(500).json(response);
    }
  });

  // PUT /api/airlines/:id - Update airline
  router.put('/:id', validateId, validateUpdateAirline, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates: UpdateAirlineRequest = req.body;
      const updatedAirline = await dbService.updateAirline(id, updates);
      const response: ApiResponse = {
        success: true,
        data: updatedAirline,
        message: 'Airline updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating airline:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      if (error instanceof DatabaseError && error.message.includes('UNIQUE constraint')) {
        const response: ApiResponse = {
          success: false,
          error: 'Conflict',
          message: 'An airline with this name already exists'
        };
        return res.status(409).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update airline'
      };
      res.status(500).json(response);
    }
  });

  // DELETE /api/airlines/:id - Delete airline
  router.delete('/:id', validateId, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await dbService.deleteAirline(id);
      const response: ApiResponse = {
        success: true,
        message: 'Airline deleted successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting airline:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete airline'
      };
      res.status(500).json(response);
    }
  });

  return router;
}