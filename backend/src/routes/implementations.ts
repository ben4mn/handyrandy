import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database.service';
import { CreateImplementationRequest, UpdateImplementationRequest, ApiResponse, NotFoundError, DatabaseError } from '../types';
import { body, param, validationResult } from 'express-validator';

export function createImplementationsRouter(dbService: DatabaseService): Router {
  const router = Router();

  // Validation middleware
  const validateCreateImplementation = [
    body('airline_id')
      .isInt({ min: 1 })
      .withMessage('Airline ID must be a positive integer'),
    body('feature_id')
      .isInt({ min: 1 })
      .withMessage('Feature ID must be a positive integer'),
    body('value')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Value is required and must be less than 255 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters'),
  ];

  const validateUpdateImplementation = [
    body('value')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Value must be less than 255 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters'),
  ];

  const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  ];

  const validateAirlineAndFeature = [
    param('airlineId').isInt({ min: 1 }).withMessage('Airline ID must be a positive integer'),
    param('featureId').isInt({ min: 1 }).withMessage('Feature ID must be a positive integer'),
  ];

  // Error handling middleware
  const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
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

  // GET /api/implementations - Get all implementations
  router.get('/', async (req: Request, res: Response) => {
    try {
      const implementations = await dbService.getAllImplementations();
      const response: ApiResponse = {
        success: true,
        data: implementations,
        message: `Found ${implementations.length} implementations`
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching implementations:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch implementations'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/implementations/:id - Get implementation by ID
  router.get('/:id', validateId, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const implementation = await dbService.getImplementationById(id);
      const response: ApiResponse = {
        success: true,
        data: implementation
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching implementation:', error);
      
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
        message: 'Failed to fetch implementation'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/implementations/:airlineId/:featureId - Get implementation by airline and feature
  router.get('/:airlineId/:featureId', validateAirlineAndFeature, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const airlineId = parseInt(req.params.airlineId);
      const featureId = parseInt(req.params.featureId);
      const implementation = await dbService.getImplementationByAirlineAndFeature(airlineId, featureId);
      
      if (!implementation) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: `Implementation for airline ${airlineId} and feature ${featureId} not found`
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: true,
        data: implementation
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching implementation:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch implementation'
      };
      res.status(500).json(response);
    }
  });

  // POST /api/implementations - Create new implementation
  router.post('/', validateCreateImplementation, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const implementationData: CreateImplementationRequest = req.body;
      
      // Check if implementation already exists
      const existing = await dbService.getImplementationByAirlineAndFeature(
        implementationData.airline_id, 
        implementationData.feature_id
      );
      
      if (existing) {
        const response: ApiResponse = {
          success: false,
          error: 'Conflict',
          message: `Implementation for airline ${implementationData.airline_id} and feature ${implementationData.feature_id} already exists`
        };
        return res.status(409).json(response);
      }
      
      const newImplementation = await dbService.createImplementation(implementationData);
      const response: ApiResponse = {
        success: true,
        data: newImplementation,
        message: 'Implementation created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating implementation:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Bad request',
          message: error.message
        };
        return res.status(400).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create implementation'
      };
      res.status(500).json(response);
    }
  });

  // PUT /api/implementations/:airlineId/:featureId - Update implementation
  router.put('/:airlineId/:featureId', validateAirlineAndFeature, validateUpdateImplementation, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const airlineId = parseInt(req.params.airlineId);
      const featureId = parseInt(req.params.featureId);
      const updates: UpdateImplementationRequest = req.body;
      
      const updatedImplementation = await dbService.updateImplementation(airlineId, featureId, updates);
      const response: ApiResponse = {
        success: true,
        data: updatedImplementation,
        message: 'Implementation updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating implementation:', error);
      
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
        message: 'Failed to update implementation'
      };
      res.status(500).json(response);
    }
  });

  // DELETE /api/implementations/:airlineId/:featureId - Delete implementation
  router.delete('/:airlineId/:featureId', validateAirlineAndFeature, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const airlineId = parseInt(req.params.airlineId);
      const featureId = parseInt(req.params.featureId);
      
      await dbService.deleteImplementation(airlineId, featureId);
      const response: ApiResponse = {
        success: true,
        message: 'Implementation deleted successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting implementation:', error);
      
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
        message: 'Failed to delete implementation'
      };
      res.status(500).json(response);
    }
  });

  return router;
}